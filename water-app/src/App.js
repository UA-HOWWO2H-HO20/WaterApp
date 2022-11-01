import React from "react";
import Header from "./header_source/Header";
import Footer from "./footer_source/Footer";
import ImageFrame from "./image_frame_source/ImageFrame"

class App extends React.Component {
    constructor(props) {
        super(props);

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
