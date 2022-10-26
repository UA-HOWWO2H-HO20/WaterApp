import React from "react";
import Header from "./header_source/Header";
import Footer from "./footer_source/Footer";
import ImageFrame from "./map_source/ImageFrame"
import MetadataSidebar from "./sidebar_source/MetadataSidebar";

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
                                    <ImageFrame />
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
