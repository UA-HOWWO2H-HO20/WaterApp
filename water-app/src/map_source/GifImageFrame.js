import React from "react";
import gifFrames from "gif-frames";
import {Slider} from "@mui/material";

import './gif_image_frame_style.css'

// TODO: create a web-worker to run the rendering process
class GifImageFrame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            useRange: true,
            minFrame: 0,
            maxFrame: 14,
            framePeriodMS: 300,
            running: true,
            currentFrame: 0
        };

        this.sleep = (ms) => new Promise(r => setTimeout(r, ms));

        this.setState = this.setState.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.displayData = this.displayData.bind(this);
        this.handleSliderInput = this.handleSliderInput.bind(this);

        this.sliderRef = React.createRef();
    }

    renderImage(frameNumber) {
        // Render the image
        gifFrames({ url: 'https://media.giphy.com/media/8VSaCyIdcnbuE/giphy.gif', frames: frameNumber, outputType: 'canvas' })
            .then(function (frameData) {
                // Create the image
                let image = frameData[0].getImage();
                // console.log(`Image loaded is ${image.width}x${image.height} px`)

                // Create canvas object
                let canvas = document.getElementById("gif-image-frame");
                let context = canvas.getContext('2d');

                // Set canvas size
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;

                // Calculate image scaling
                const horizontalRatio = canvas.width  / image.width;
                const verticalRatio =  canvas.height / image.height;
                const ratio = Math.min(horizontalRatio, verticalRatio);

                // Calculate x/y offset
                const xShift = ( canvas.width - image.width * ratio ) / 2;
                const yShift = ( canvas.height - image.height * ratio ) / 2;

                // Draw the image
                context.clearRect(0,0, canvas.width, canvas.height);
                context.drawImage(image, 0,0, image.width, image.height, xShift, yShift, image.width * ratio, image.height * ratio, this);
            }).catch((error) => { console.log('Error in map rendering: ' + error)});
    }

    async displayData() {
        if(this.state.useRange)
        {
            this.setState({currentFrame: this.state.currentFrame + 1});

            if(this.state.currentFrame > this.state.maxFrame)
                this.setState({currentFrame: this.state.minFrame});

            // Call the function again
            setTimeout(this.displayData, this.state.framePeriodMS);
        }

        this.renderImage(this.state.currentFrame);
    }

    async componentDidMount() {
        await this.displayData();
    }

    async handleSliderInput(newValue) {
        this.setState({useRange: false, currentFrame: newValue});
        await this.displayData();
    }

    render() {
        return (
            <div id="gif-image-frame-container">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <canvas id="gif-image-frame" />
                            </td>
                        </tr>
                    <tr>
                        <td>
                            <Slider
                                ref={this.sliderRef}
                                id="gif-image-frame-slider"
                                aria-label="GIF Frame"
                                value={this.state.currentFrame}
                                valueLabelDisplay="auto"
                                step={1}
                                marks
                                min={this.state.minFrame}
                                max={this.state.maxFrame + 1}
                                onChange={(e, val) => { this.handleSliderInput(val); }}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default GifImageFrame;