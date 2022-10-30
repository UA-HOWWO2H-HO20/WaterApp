import React from "react";
import Header from "./header_source/Header";
import Footer from "./footer_source/Footer";
import GifImageFrame from "./map_source/GifImageFrame"
import MetadataSidebar from "./metadata_sidebar_source/MetadataSidebar";

import "./App.css";

class App extends React.Component {
    constructor(props) {
        super(props);

        // Coordinates for tuscaloosa
        this.state = {
            //longitude
            lng: -86.9,
            //lattitude
            lat: 32.3,
            //zoom
            zoom: 7,
            //make dynami
            displayMarkerDot: false
        }

        this.setState = this.setState.bind(this);
    }

    render() {
        return (
            <div className="App">
                <Header />
                <div className={"map-container"}>
                    <table className={"map-table"}>
                        <tbody>
                        <tr>
                            <td className={"map-sidebar-td"}>
                                <MetadataSidebar />
                            </td>
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
