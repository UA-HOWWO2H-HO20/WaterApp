import React from "react";
import fetch from 'node-fetch';

import "./search_bar_style.css"

const LocationSearchBar = (props) => {
    const processInput = () => {
        const data = document.getElementById("location-search-bar-field").value
        console.log("Processing request for location: " + data)

        // Format string for API request URL
        const formattedData = encodeURIComponent(data)
        const apiKey = "d8a222a86303429e9c8ebbac9c9bdb95"

        let fetch = require('node-fetch');
        let requestOptions = {
            method: 'GET',
        };

        const address = 'redacted'
        const formattedAddress = encodeURIComponent(address)

        const response = fetch("https://api.geoapify.com/v1/geocode/search?text=" + formattedAddress + "&apiKey=" + apiKey, requestOptions).then(response => response.json(true))
        console.log(response)
            // .then(response => response.json())
            // .then(result => console.log(result))
            // .catch(error => console.log('error', error));

        props.callback({lat: 40.7, long: -73.9, zoom: 7})
    }

    return (<div id={"location-search-bar"}>
        <table>
            <tbody>
                <tr>
                    <td id={"location-search-bar-td-first"}>
                        <input id={"location-search-bar-field"} type="text" placeholder={"Where to?"} />
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