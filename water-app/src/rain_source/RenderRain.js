import React from "react";

import "./rain_style.css"

class RenderRain extends React.Component {
    constructor({props, dropletCount}) {
        super(props);

        this.state = { dropletCount: dropletCount }

        this.setState = this.setState.bind(this)
    }

    render() {
        let hrElement;
        let counter = 30;
        for (let i = 0; i < counter; i++) {
            hrElement = document.createElement("HR");

            hrElement.style.left = Math.floor(Math.random() * window.innerWidth) + "px";
            hrElement.style.animationDuration = 0.2 + Math.random() * 0.3 + "s";
            hrElement.style.animationDelay = Math.random() * 5 + "s";

            document.body.appendChild(hrElement);
        }

        return <div></div>
    }
}

export default RenderRain
