import React from "react";
import gifFrames from "gif-frames";
import {Slider, Stack, SvgIcon} from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import './gif_image_frame_style.css'

// TODO: create a web-worker to run the rendering process
class GifImageFrame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minFrame: 0,
            maxFrame: 14,
            framePeriodMS: 500,
            running: true,
            currentFrame: 0
        };

        this.ref = React.createRef();

        this.sleep = (ms) => new Promise(r => setTimeout(r, ms));

        this.setState = this.setState.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.displayData = this.displayData.bind(this);
        this.handleSliderInput = this.handleSliderInput.bind(this);
        this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
        this.handleDataSelectionEvent = this.handleDataSelectionEvent.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    renderImage(frameNumber, minFrame) {
        // Render the image
        if(frameNumber > minFrame)
        {
            gifFrames({ url: 'https://media.giphy.com/media/8VSaCyIdcnbuE/giphy.gif', frames: `${minFrame}-${frameNumber}`, outputType: 'canvas' })
                .then(function (frameData) {


                    // Create canvas object
                    let canvas = document.getElementById("gif-image-frame");
                    let context = canvas.getContext('2d');

                    // Set canvas size
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    for(let i = minFrame; i < frameNumber; i++)
                    {
                        // Create the image
                        let image = frameData[i - minFrame].getImage();

                        // Calculate image scaling
                        const horizontalRatio = canvas.width  / image.width;
                        const verticalRatio =  canvas.height / image.height;
                        const ratio = Math.min(horizontalRatio, verticalRatio);

                        // Calculate x/y offset
                        const xShift = ( canvas.width - image.width * ratio ) / 2;
                        const yShift = ( canvas.height - image.height * ratio ) / 2;

                        // Draw the image
                        // context.clearRect(0,0, canvas.width, canvas.height);
                        context.drawImage(image, 0,0, image.width, image.height, xShift, yShift, image.width * ratio, image.height * ratio, this);
                    }
                }).catch((error) => { console.log('Error in map rendering: ' + error)});
        }
        else
        {
            gifFrames({ url: 'https://media.giphy.com/media/8VSaCyIdcnbuE/giphy.gif', frames: `${frameNumber}`, outputType: 'canvas' })
                .then(function (frameData) {


                    // Create canvas object
                    let canvas = document.getElementById("gif-image-frame");
                    let context = canvas.getContext('2d');

                    // Set canvas size
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;

                    // Create the image
                    let image = frameData[0].getImage();

                    // Calculate image scaling
                    const horizontalRatio = canvas.width  / image.width;
                    const verticalRatio =  canvas.height / image.height;
                    const ratio = Math.min(horizontalRatio, verticalRatio);

                    // Calculate x/y offset
                    const xShift = ( canvas.width - image.width * ratio ) / 2;
                    const yShift = ( canvas.height - image.height * ratio ) / 2;

                    // Draw the image
                    // context.clearRect(0,0, canvas.width, canvas.height);
                    context.drawImage(image, 0,0, image.width, image.height, xShift, yShift, image.width * ratio, image.height * ratio, this);
                }).catch((error) => { console.log('Error in map rendering: ' + error)});
        }
    }

    async displayData() {
        if(this.state.running)
        {
            this.setState({currentFrame: this.state.currentFrame + 1});

            if(this.state.currentFrame > this.state.maxFrame)
                this.setState({currentFrame: this.state.minFrame});

            // Call the function again
            setTimeout(this.displayData, this.state.framePeriodMS);
        }

        this.renderImage(this.state.currentFrame, this.state.minFrame);
    }

    componentDidMount() {
        // Create listener for refresh events coming from the data selector
        window.addEventListener('data-refresh', (event) => { this.handleDataSelectionEvent(event); });

        setTimeout(this.displayData, 1);
    }

    componentWillUnmount() {
        // Remove event listener
        window.removeEventListener('data-refresh', (event) => { this.handleDataSelectionEvent(event); });
    }

    handleSliderInput(newValue) {
        this.setState({running: false, currentFrame: newValue - 1});

        setTimeout(this.displayData, 1);
    }

    handlePlayButtonClick() {
        const oldState = this.state.running;
        this.setState({running: !oldState});

        setTimeout(this.displayData, 1);
    }

    async handleDataSelectionEvent(event) {
        // TODO: pull data from the server
        console.log('Frame got request for rows:' + event.toString());


        // Send a reply to the selector so that the button unlocks
        // TODO: remove sleep for testing
        await new Promise(r => setTimeout(r, 1000));

        const response = new Event('data-loaded');
        dispatchEvent(response);
    }

    render() {
        let pausePlayIcon = <PauseIcon />;

        if(!this.state.running) {
            pausePlayIcon = <PlayArrowIcon />
        }

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
                            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center" justifyContent="center">
                                <SvgIcon id="gif-image-play-button" color="primary" onClick={(event) => { this.handlePlayButtonClick(); }}>
                                    {pausePlayIcon}
                                </SvgIcon>
                                <Slider
                                    id="gif-image-frame-slider"
                                    aria-label="GIF Frame"
                                    value={this.state.currentFrame + 1}
                                    valueLabelDisplay="auto"
                                    step={1}
                                    marks
                                    min={this.state.minFrame + 1}
                                    max={this.state.maxFrame + 1}
                                    onChange={(e, val) => { this.handleSliderInput(val); }}
                                />
                            </Stack>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default GifImageFrame;