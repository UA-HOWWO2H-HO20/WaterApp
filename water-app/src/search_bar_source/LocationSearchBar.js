import React, { Component }  from 'react';
import Dialog from "@material-ui/core/Dialog";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogActions from "@material-ui/core/DialogActions";
import fetch from 'node-fetch';

import "./search_bar_style.css"
import {Button, DialogContent} from "@material-ui/core";

class LocationSearchBar extends React.Component {
    constructor({props, callback, apiKey}) {
        super(props);

        this.state = { callback: callback,
                       apiKey: apiKey,
                       alertOpen: false,
                       alertText: ""}

        this.setState = this.setState.bind(this)
        this.checkResponseCode = this.checkResponseCode.bind(this)
        this.processJSONData = this.processJSONData.bind(this)
        this.processInput = this.processInput.bind(this)
        this.checkForEnter = this.checkForEnter.bind(this)
        this.alertUser = this.alertUser.bind(this)
        this.handleAlertClose = this.handleAlertClose.bind(this)
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
            .catch(error => this.alertUser("Couldn't find a location based on what you entered. Try again using a city and state, or an address!"))
    }

    // Check for enter characters in the box so hitting enter after an address works correctly
    checkForEnter(event) {
        if(event.key === 'Enter')
            this.processInput()
    }

    // Helper to display alerts to user
    alertUser(errorMessage) {
        console.log(errorMessage)

        this.setState({alertOpen: true, alertText: errorMessage})
    }

    // Run by alert exit button
    handleAlertClose() {
        this.setState({alertOpen: false, alertText: ""})
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
            <Dialog open={this.state.alertOpen} onClose={this.handleAlertClose}>
                <DialogTitle>{"Something went wrong :/"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {this.state.alertText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAlertClose}
                            color="primary" autoFocus>
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
        </div>)
    }
}

export default LocationSearchBar;