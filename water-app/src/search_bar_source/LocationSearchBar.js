import React from "react";
import fetch from 'node-fetch';

import "./search_bar_style.css"

const LocationSearchBar = (props) => {
    // Helper to check HTTP error code status
    const checkResponseCode = (response) => {
        if(response.ok)
            return response
        else
            // TODO: show error dialogue instead
            throw new Error('Response to geocode invalid: ${res.status} ${res.statusText}')
    }

    // Helper to call callback with results
    const processJSONData = (lat, long) => {
        console.log("Refreshing page using geocode results (lat: " + lat + ", lng: " + long + ")")
        props.callback({lng: long, lat: lat, zoom: 7})
    }

    // Process the input of the text field
    const processInput = () => {
        const data = document.getElementById("location-search-bar-field").value
        console.log("Processing request for location: " + data)

        // Format string for API request URL
        const formattedData = encodeURIComponent(data)
        const apiKey = "d8a222a86303429e9c8ebbac9c9bdb95"

        fetch("https://api.geoapify.com/v1/geocode/search?text=" + formattedData + "&apiKey=" + apiKey + "&format=json", { method: 'GET' })
            .then(checkResponseCode)
            .then(res => res.json())
            .then(json => {
                processJSONData(json.results[0].lat, json.results[0].lon)
            })
            .catch(error => console.log("Caught error in geocoding: " + error))
    }

    // Check for enter characters in the box so hitting enter after an address works correctly
    const checkForEnter = (event) => {
        if(event.key === 'Enter')
            processInput()
    }

    return (<div id={"location-search-bar"}>
        <table>
            <tbody>
                <tr>
                    <td id={"location-search-bar-td-first"}>
                        <input id={"location-search-bar-field"} type="text" placeholder={"Where to?"} onKeyDown={(e) => { checkForEnter(e) }}/>
                    </td>
                    <td id={"location-search-bar-td"}>
                        <button id={"location-search-bar-button"} onClick={() => { processInput() }}>Go!</button>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>)
}

export default LocationSearchBar;