import React from "react";
import Header from "./header_source/Header";
import Footer from "./footer_source/Footer";
import GifImageFrame from "./map_source/GifImageFrame"

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

        // Create custom events
        this.markerDotEvent = new Event('toggle-marker-dot');
    }

    render() {
        return (
            <div className="App">
                <Header />
                {/*<LocationSearchBar apiKey={this.apiKey}/>*/}
                <div className={"map-container"}>
                    <table className={"map-table"}>
                        <tbody>
                        <tr>
                            <td className={"map-sidebar-td"}>
                                {/*Horizontal spacing to center map*/}
                                <p></p>                            </td>
                            <td className={"map-td"}>
                                    <GifImageFrame />
                            </td>
                            <td className={"map-sidebar-td"}>
                                {/*Horizontal spacing to center map*/}
                                <p></p>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
                <Footer />
            </div>
        )
    }
}

export default App;
