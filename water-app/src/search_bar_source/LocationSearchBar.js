import React, { Component }  from 'react';
import fetch from 'node-fetch';

import "./search_bar_style.css"

class LocationSearchBar extends React.Component {
    constructor({props, callback, apiKey}) {
        super(props);

        // this.state = { callback: () => { console.log("LocationSearchBar callback run without being set first!")},
        //                apiKey: "d8a222a86303429e9c8ebbac9c9bdb95"
        //              }
        this.state = { callback: callback,
                       apiKey: apiKey }

        this.setState = this.setState.bind(this)
        this.checkResponseCode = this.checkResponseCode.bind(this)
        this.processJSONData = this.processJSONData.bind(this)
        this.processInput = this.processInput.bind(this)
        this.checkForEnter = this.checkForEnter.bind(this)
    }

    // Helper to check HTTP error code status
    checkResponseCode(response) {
        if(response.ok)
            return response
        else
            // TODO: show error dialogue instead
            throw new Error('Response to geocode invalid: ${res.status} ${res.statusText}')
    }

    // Helper to call callback with results
    processJSONData(lat, long) {
        console.log("Refreshing page using geocode results (lat: " + lat + ", lng: " + long + ")")
        this.state.callback({lng: long, lat: lat, zoom: 7})
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
            .catch(error => console.log("Caught error in geocoding: " + error))
    }

    // Check for enter characters in the box so hitting enter after an address works correctly
    checkForEnter(event) {
        if(event.key === 'Enter')
            this.processInput()
    }

    // Render method overload
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
        </div>)
    }
}

export default LocationSearchBar;