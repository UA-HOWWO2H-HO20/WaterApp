import React  from 'react';
import AlertWindow from "../alert_source/AlertWindow";
import fetch from 'node-fetch';

import "./search_bar_style.css"

class LocationSearchBar extends React.Component {
    constructor({props, apiKey}) {
        super(props);

        this.state = { apiKey: apiKey }

        this.setState = this.setState.bind(this)
        this.checkResponseCode = this.checkResponseCode.bind(this)
        this.processJSONData = this.processJSONData.bind(this)
        this.processInput = this.processInput.bind(this)
        this.checkForEnter = this.checkForEnter.bind(this)
        this.alertUser = this.alertUser.bind(this)

        this.setAlertCallback = (func) => { this.alertSetStateReference = func }
        this.alertSetStateReference = () => {}
    }

    // Helper to check HTTP error code status
    checkResponseCode(response) {
        if(response.ok)
            return response
        else
            this.alertUser("Got a bad response to the location search. May be having connection problems to the map server")
            return ""
    }

    // Helper to call callback with results
    processJSONData(lat, lng) {
        console.log("Refreshing page using geocode results (lat: " + lat + ", lng: " + lng + ")")

        document.dispatchEvent(new CustomEvent('location-search', { detail: { lat: lat, lng: lng }}));
    }

    // Process the input of the text field
    processInput() {
        const data = document.getElementById("location-search-bar-field").value
        console.log("Processing request for location: " + data)

        // Format string for API request URL
        const formattedData = encodeURIComponent(data)

        fetch("https://api.geoapify.com/v1/geocode/search?text=" + formattedData + "&apiKey=" + this.state.apiKey + "&format=json", { method: 'GET' })
            .then(this.checkResponseCode)
            .then(res => res.json())
            .then(json => {
                this.processJSONData(json.results[0].lat, json.results[0].lon)
            })
            .catch(() => this.alertUser("Couldn't find a location based on what you entered. Try again using a city and state, or an address!"))
    }

    // Check for enter characters in the box so hitting enter after an address works correctly
    checkForEnter(event) {
        if(event.key === 'Enter')
            this.processInput()
    }

    // Helper to display alerts to user
    alertUser(errorMessage) {
        console.log(errorMessage)

        this.alertSetStateReference({open: true, errorText: errorMessage})
    }

    // Render method overload
    // Dialogue object will only be rendered if there is an error and the state is updated
    render() {
        return (<div id={"location-search-bar"}>
            <table>
                <tbody>
                <tr>
                    <td id={"location-search-bar-td-first"}>
                        <input id={"location-search-bar-field"} type="text" placeholder={"Where to?"} onKeyDown={(e) => { this.checkForEnter(e) }}/>
                    </td>
                    <td id={"location-search-bar-td"}>
                        <button id={"location-search-bar-button"} onClick={() => { this.processInput() }}>Go!</button>
                    </td>
                </tr>
                </tbody>
            </table>
            <AlertWindow setStateReference={ this.setAlertCallback }/>
        </div>)
    }
}

export default LocationSearchBar;