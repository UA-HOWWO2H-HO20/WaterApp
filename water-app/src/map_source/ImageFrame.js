import React from "react";
import {Slider, Stack, SvgIcon} from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import './image_frame_style.css'

class ImageFrame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minFrame: 0,
            maxFrame: 2,
            currentFrame: 0,
            framePeriodMS: 500,
            running: true,
            imagesLoaded: false
        };

        this.imageSources = ["https://via.placeholder.com/960x720.jpeg?text=Image+1",
            "https://via.placeholder.com/960x720.jpeg?text=Image+2",
            "https://via.placeholder.com/960x720.jpeg?text=Image+3"];
        
        this.sleep = (ms) => new Promise(r => setTimeout(r, ms));

        this.setState = this.setState.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.displayData = this.displayData.bind(this);
        this.handleSliderInput = this.handleSliderInput.bind(this);
        this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
        this.handleDataSelectionEvent = this.handleDataSelectionEvent.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.checkImage = this.checkImage.bind(this);
        this.loadImages = this.loadImages.bind(this);
    }
    
    // Helper to request the images from the backend server and update the state with their URLS
    loadImages() {
        Promise.all(
            this.imageSources.map(this.checkImage)
        ).then(() => {
            this.setState({ imagesLoaded: true });
            console.log(`Loaded image sources: ${this.imageSources}`)
        }, () => { 
            console.error('Failed to load images'); 
        });           
    }

    // Helper to verify images
    checkImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(path)
            img.onerror = () => reject()

            img.src = path
        })
    }

    // Render the image
    renderImage(imageIndex) {
        // Create canvas object
        let canvas = document.getElementById("image-frame");
        let context = canvas.getContext('2d');

        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create the image
        let image = new Image();
        image.src = this.imageSources.at(imageIndex);

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

        // Probably not needed, but making this async helps with the displayData function
        // TODO: evaluate this
        return new Promise((r) => {r()});
    }

    async displayData() {
        // Load objects from state once to keep it efficient
        let nextFrame = this.state.currentFrame;
        const minFrame = this.state.minFrame;
        const maxFrame = this.state.maxFrame;
        const running = this.state.running;

        if(running) {
            nextFrame = nextFrame + 1;

            if(nextFrame > maxFrame)
                nextFrame = minFrame;
        }

        // Async call to render
        this.renderImage(nextFrame).then(() => {
            // Update the state so the slider updates
            this.setState({currentFrame: nextFrame});

            // Call the function again if running
            if(running)
                setTimeout(this.displayData, this.state.framePeriodMS);
        });
    }

    componentDidMount() {
        // Create listener for refresh events coming from the data selector
        window.addEventListener('data-refresh', (event) => { this.handleDataSelectionEvent(event); });
        
        // Start loading the initial images
        this.loadImages();

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
            <div id="image-frame-container">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <canvas id="image-frame" />
                            </td>
                        </tr>
                    <tr>
                        <td>
                            <Stack spacing={2} direction="row" sx={{ mb: 1 }} alignItems="center" justifyContent="center">
                                <SvgIcon id="image-play-button" color="primary" onClick={(event) => { this.handlePlayButtonClick(); }}>
                                    {pausePlayIcon}
                                </SvgIcon>
                                <Slider
                                    id="image-frame-slider"
                                    aria-label="Image Index"
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

export default ImageFrame;