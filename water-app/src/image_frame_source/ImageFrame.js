import React from "react";
import {Button, Slider, Stack, SvgIcon} from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import AutorenewIcon from '@mui/icons-material/Autorenew';

import ServerRequester from "./ServerRequester";

import './image_frame_style.css'

class ImageFrame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minFrame: 0,
            maxFrame: 1,
            currentFrame: 0,
            framePeriodMS: 500,
            running: true,
            imagesLoaded: false,
            inOverlayRefresh: false,
            imageMetadata: []
        };

        // Store the current row selection from the table
        this.selectedOverlayRows = [];

        // Head cells for metadata
        this.metadataHeadCells = [
            {
                field: 'overlay_name',
                headerName: 'Overlay Name',
                sortable: false,
                width: 200
            },
            {
                field: 'start_date',
                headerName: 'Start Date',
                sortable: false,
                width: 200
            },
            {
                field: 'end_date',
                headerName: 'End Date',
                sortable: false,
                width: 200
            }];

        // Original image sources for initial animation
        this.imageSources = ["https://via.placeholder.com/960x720.jpeg?text=Image+1",
            "https://via.placeholder.com/960x720.jpeg?text=Image+2",
            "https://via.placeholder.com/960x720.jpeg?text=Image+3"];

        // Create a server requester object
        this.requester = new ServerRequester();

        // URL of image to be shown if data has not loaded yet.
        // This is a site with an API to create placeholder images, good enough for our purposes.
        // This could be replaced with some other image later on if needed.
        this.dataNotLoadedBackground = "https://via.placeholder.com/960x720.jpeg?text=Fetching data from server...";

        this.sleep = (ms) => new Promise(r => setTimeout(r, ms));

        this.setState = this.setState.bind(this);
        this.renderImage = this.renderImage.bind(this);
        this.displayData = this.displayData.bind(this);
        this.handleSliderInput = this.handleSliderInput.bind(this);
        this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.cacheImage = this.cacheImage.bind(this);
        this.loadImages = this.loadImages.bind(this);
        this.handleOverlayButtonClick = this.handleOverlayButtonClick.bind(this);
        this.handleOverlayRowSelect = this.handleOverlayRowSelect.bind(this);
    }
    
    // Helper to request the images from the backend server and update the state with their URLS
    loadImages() {
        Promise.all(
            this.imageSources.map(this.cacheImage)
        ).then(() => {
            this.setState({ imagesLoaded: true });
            console.log(`Loaded image sources: ${this.imageSources}`);
        }, () => { 
            console.error('Failed to load images'); 
        });           
    }

    // Helper to cache images in the browser, which speeds up loading time
    cacheImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            img.onload = () => resolve(path)
            img.onerror = () => reject()

            img.src = path
        });
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
        const imagesLoaded = this.state.imagesLoaded;

        // Only render the canvas if the images are loaded, otherwise render the placeholder
        if(imagesLoaded)
        {
            if(running) {
                nextFrame = nextFrame + 1;

                if(nextFrame > maxFrame)
                    nextFrame = minFrame;
            }

            // Async call to render
            this.renderImage(nextFrame).then(() => {
                // Update the state so the slider updates
                this.setState({currentFrame: nextFrame});
            });
        }
    }

    componentDidMount() {
        // Begin the initial metadata fetch
        this.requester.fetchMetaDataFromServer().then((result) => {
            console.log('Metadata fetch completed by requester.');

            // Save the metadata locally
            this.setState({imageMetadata: result});
        });
        
        // Start loading the initial images
        this.loadImages();

        // Start an interval to display the data
        this.displayInterval = setInterval(this.displayData, this.state.framePeriodMS);
    }

    componentWillUnmount() {
        // Clear display interval
        clearInterval(this.displayInterval);
    }

    handleSliderInput(newValue) {
        this.setState({running: false, currentFrame: newValue - 1});
    }

    handlePlayButtonClick() {
        const oldState = this.state.running;
        this.setState({running: !oldState});
    }

    async handleOverlayButtonClick() {
        this.setState({inRefresh: true});

        // TODO: pull data from the server
        console.log('Frame got request for rows:' + this.selectedOverlayRows.toString());

        // Parse data
        let requestedIDs = this.selectedOverlayRows;
        let overlayNames = '';

        // TODO: figure out how to replace this later
        for(let i = 0; i < requestedIDs.length; i++) {
            const currentID = parseInt(requestedIDs.at(i));

            for(let j = 0; j < this.state.imageMetadata.length; j++) {
                const item = this.state.imageMetadata.at(j);

                if(item.id === currentID) {
                    overlayNames = overlayNames + `${item.overlay_name} - `
                    console.log(`User selected: ${item.overlay_name}`)
                }
            }
        }

        if(overlayNames.length > 0)
            overlayNames.slice(0, -3);

        let newURLs = [];
        for(let i = 0; i < 3; i++)
        {
            const newURL = `https://via.placeholder.com/960x720.jpeg?text=${overlayNames.replace(' ', '+')} ${i + 1}`;
            newURLs.push(newURL);
        }

        // Save the new image sources
        this.imageSources = newURLs;

        // Load the images and re-render
        this.loadImages();

        // Unlock the selector
        this.setState({inRefresh: false});
    }

    handleOverlayRowSelect(data) {
        this.selectedOverlayRows = data;
    }

    render() {
        // Create the toggleable pause/play icon
        let pausePlayIcon = <PauseIcon />;

        if(!this.state.running) {
            pausePlayIcon = <PlayArrowIcon />
        }

        // Create the canvas component. If the images are not loaded, show the placeholder
        let canvasComponent = this.state.imagesLoaded ? <canvas id="image-frame" /> : <img id="placeholder-image" alt="" src={this.dataNotLoadedBackground}/>;

        // Fetch server data
        const metadataRows = this.state.imageMetadata;
        const metadataColumns = this.metadataHeadCells;

        let overlaySelectorButton;

        // Create button object
        if(this.state.inRefresh)
        {
            overlaySelectorButton = <Button id="metadata-grid-button" variant="contained" disabled={true} startIcon={<AutorenewIcon />}>Fetching data...</Button>;
        }
        else
        {
            overlaySelectorButton = <Button id="metadata-grid-button" variant="contained" onClick={() => { this.handleOverlayButtonClick(); }}>Fetch Data</Button>;
        }

        return (
            <div className={"map-container"}>
                <table className={"map-table"}>
                    <tbody>
                    <tr>
                        <td className={"map-sidebar-td"}>
                            <Stack spacing={2}>
                                <Box sx={{ height: '75vh', width: '20vw' }}>
                                    <DataGrid id="metadata-grid"
                                              rows={metadataRows}
                                              columns={metadataColumns}
                                              pageSize={10}
                                              hideFooterPagination
                                              checkboxSelection
                                              onSelectionModelChange={(data) => {
                                                  this.handleOverlayRowSelect(data);
                                              }}
                                    />
                                </Box>
                                {overlaySelectorButton}
                            </Stack>
                        </td>
                        <td className={"map-td"}>
                            <div id="image-frame-container">
                                <table>
                                    <tbody>
                                    <tr>
                                        <td>
                                            {canvasComponent}
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
                        </td>
                        <td className={"map-sidebar-td"}>
                            {/*Horizontal spacing to center map*/}
                            <p></p>
                        </td>
                    </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default ImageFrame;