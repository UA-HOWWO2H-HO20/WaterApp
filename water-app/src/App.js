import React from "react";
import Header from "./header_source/Header";
import Footer from "./footer_source/Footer";
import ImageFrame from "./image_frame_source/ImageFrame"

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
                    <ImageFrame />
                <Footer />
            </div>
        )
    }
}

export default App;
