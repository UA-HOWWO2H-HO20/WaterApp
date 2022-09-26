import React from "react";
import WaterMap from "./map_source/WaterMap";
import Header from "./header_source/Header";
import LocationSearchBar from "./search_bar_source/LocationSearchBar";
import Footer from "./footer_source/Footer";
import OverlaySelector from "./overlay_selector_source/OverlaySelector"

import "./App.css";

class App extends React.Component {
    constructor(props) {
        super(props);

        // Coordinates for tuscaloosa
        this.state = {
            lng: -86.9,
            lat: 32.3,
            zoom: 7,
            displayMarkerDot: false
        }

        // GeoApify API key
        this.apiKey = "d8a222a86303429e9c8ebbac9c9bdb95"

        this.setState = this.setState.bind(this);
        this.getState = this.getState.bind(this);

        // Create custom events
        this.markerDotEvent = new Event('toggle-marker-dot');
    }

    // Returns the current state
    getState() {
        return this.state;
    }

    render() {
        return (
            <div className="App">
                <Header />
                <LocationSearchBar callback={this.setState} apiKey={this.apiKey}/>
                <div className={"map-container"}>
                    <table className={"map-table"}>
                        <tbody>
                        <tr>
                            <td className={"map-sidebar-td"}>
                                <OverlaySelector locationClickFunction={() => { document.dispatchEvent(this.markerDotEvent); }}/>
                            </td>
                            <td className={"map-td"}>
                                    <WaterMap initialLat={this.state.lat}
                                              initialLng={this.state.lng}
                                              initialZoom={this.state.zoom}
                                              apiKey={this.apiKey} />
                            </td>
                            <td className={"map-sidebar-td"}>
                                {/*Horizontal spacing to center map*/}
                                <p></p>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    {/*<RenderRain />*/}
                </div>
                <Footer />
            </div>
        )
    }
}

export default App;
