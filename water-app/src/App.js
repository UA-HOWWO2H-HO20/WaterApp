import WaterMap from "./map_source/WaterMap";
import Header from "./header_source/Header";
import RenderRain from "./rain_source/RenderRain";
import LocationSearchBar from "./search_bar_source/LocationSearchBar";

import React from "react";

import "./App.css";

class App extends React.Component {
    constructor(props) {
        super(props);

        // Coordinates for tuscaloosa
        this.state = {
            lng: -86.9,
            lat: 32.3,
            zoom: 7
        }

        // GeoApify API key
        this.apiKey = "d8a222a86303429e9c8ebbac9c9bdb95"

        this.setState = this.setState.bind(this)
    }

    render() {
        return (
            <div className="App">
                <Header />
                <LocationSearchBar callback={this.setState} apiKey={this.apiKey}/>
                <div className={"map-container"}>
                    <WaterMap initialLat={this.state.lat} initialLng={this.state.lng} initialZoom={this.state.zoom} apiKey={this.apiKey}/>
                    <RenderRain />
                </div>
            </div>
        )
    }
}

export default App;
