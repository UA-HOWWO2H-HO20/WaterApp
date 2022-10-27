import React from "react";
import {Button, Slider, Stack, SvgIcon} from "@mui/material";
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import ServerRequester from "./ServerRequester";

import './image_frame_style.css'

class ImageFrame extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            minFrame: 0,
            maxFrame: 1,
            currentFrame: 0,
            running: true,
            imagesLoaded: false,
            inOverlayRefresh: false,
            imageMetadata: [],
            selectionStartDate: new Date(),
            selectionEndDate: new Date(),
            startDateValue: new Date(),
            endDateValue: new Date(),
            playbackFPS: 2,
            selectedOverlayRows: [],
            timeStepValue: 1,
            timeStepPeriod: 2
        };

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

        // this.sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
        this.displayInterval = setInterval(this.displayData, (1000 / this.state.playbackFPS));
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
        // Start the call to lock the button from being pressed
        this.setState({inRefresh: true});

        console.log('Frame got request for rows:' + this.state.selectedOverlayRows.toString());

        // Create the interval
        // TODO: months are different lengths, so we need to change this later on
        const timeStepMultipliers = [1000, 60, 60, 24, 7, 4, 12];
        const timeStepPeriod = this.state.timeStepPeriod;
        let totalMS = 1;
        for(let i = 0; i <= timeStepPeriod; i++)
        {
            totalMS = totalMS * timeStepMultipliers[i];
        }
        totalMS = totalMS * this.state.timeStepValue;

        // Load the new image sources
        this.imageSources = this.requester.getImageURLsFromSelection(this.state.selectedOverlayRows,
            this.state.imageMetadata,
            totalMS,
            this.state.startDateValue,
            this.state.endDateValue);

        // Load the images and re-render
        this.loadImages();

        // Unlock the selector
        this.setState({inRefresh: false, maxFrame: this.imageSources.length - 1});
    }

    handleOverlayRowSelect(data) {
        // Load the start and end dates so that the selector will be populated
        let maxStartTime = new Date(0);
        let minEndTime = new Date();

        data.forEach((index) => {
            let item;

            for(let j = 0; j < this.state.imageMetadata.length; j++) {
                const candidate = this.state.imageMetadata.at(j);

                if(candidate.id === index) {
                    item = candidate;
                    break;
                }
            }

            if(new Date(item.start_date) > maxStartTime)
                maxStartTime = new Date(item.start_date);
            if(new Date(item.end_date) < minEndTime)
                minEndTime = new Date(item.end_date);
        });

        this.setState({ selectionStartDate: maxStartTime,
            selectionEndDate: minEndTime,
            startDateValue: maxStartTime,
            endDateValue: minEndTime });

        this.setState({selectedOverlayRows: data});
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
            overlaySelectorButton = <Button id="metadata-grid-button" variant="contained" onClick={() => { this.handleOverlayButtonClick().then(); }}>Fetch Data</Button>;
        }

        return (
            <div className={"map-container"}>
                <table className={"map-table"}>
                    <tbody>
                    <tr>
                        <td className={"map-sidebar-td"}>
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
                                                <SvgIcon id="image-play-button" color="primary" onClick={() => { this.handlePlayButtonClick(); }}>
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
                            <Stack sx={{ height: '72vh', width: '20vw' }} spacing={2} alignItems="stretch" justifyContent="flex-start">
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DateTimePicker
                                        label={"Start"}
                                        renderInput={(params) => <TextField {...params} />}
                                        value={this.state.startDateValue}
                                        onChange={(value) => {
                                            this.setState({startDateValue: value});
                                        }}
                                    />
                                    <DateTimePicker
                                        label={"End"}
                                        renderInput={(params) => <TextField {...params} />}
                                        value={this.state.endDateValue}
                                        onChange={(value) => {
                                            this.setState({endDateValue: value});
                                        }}
                                    />
                                </LocalizationProvider>
                                <Stack direction="row" spacing={2} alignItems="stretch" justifyContent="stretch">
                                    <Button className={"fps-selector-button"}
                                            variant="standard"
                                            color="primary"
                                            disabled={true}>
                                        Playback FPS
                                    </Button>
                                    <Button className={"fps-selector-button"}
                                            variant={this.state.playbackFPS === 2 ? "contained" : "outlined"}
                                            color="primary"
                                            onClick={() => {
                                                // Reset the display interval
                                                clearInterval(this.displayInterval);
                                                this.displayInterval = setInterval(this.displayData, (1000 / 2));

                                                // Update the state
                                                this.setState({playbackFPS: 2});
                                            }}>
                                        2
                                    </Button>
                                    <Button className={"fps-selector-button"}
                                            variant={this.state.playbackFPS === 5 ? "contained" : "outlined"}
                                            color="primary"
                                            onClick={() => {
                                                // Reset the display interval
                                                clearInterval(this.displayInterval);
                                                this.displayInterval = setInterval(this.displayData, (1000 / 5));

                                                // Update the state
                                                this.setState({playbackFPS: 5});
                                            }}>
                                        5
                                    </Button>
                                    <Button className={"fps-selector-button"}
                                            variant={this.state.playbackFPS === 10 ? "contained" : "outlined"}
                                            color="primary"
                                            onClick={() => {
                                                // Reset the display interval
                                                clearInterval(this.displayInterval);
                                                this.displayInterval = setInterval(this.displayData, (1000 / 10));

                                                // Update the state
                                                this.setState({playbackFPS: 10});
                                            }}>
                                        10
                                    </Button>
                                </Stack>
                                <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="stretch">
                                    <TextField className="time-step-selector-box"
                                               label={"Time step"}
                                               type="number"
                                               value={this.state.timeStepValue}
                                               InputProps={{ inputProps: { min: 0, max: 10 } }}
                                               onChange={(event) => {
                                                   this.setState({timeStepValue: event.target.value});
                                               }}
                                    />
                                    <FormControl style={{minWidth: 120}}>
                                        <InputLabel id="demo-simple-select-label">Interval</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-label"
                                            id="demo-simple-select"
                                            value={this.state.timeStepPeriod}
                                            label="Select"
                                            onChange={(event) => {
                                                this.setState({timeStepPeriod: event.target.value});
                                            }}
                                        >
                                            <MenuItem value={0}>Seconds</MenuItem>
                                            <MenuItem value={1}>Minutes</MenuItem>
                                            <MenuItem value={2}>Hours</MenuItem>
                                            <MenuItem value={3}>Days</MenuItem>
                                            <MenuItem value={4}>Weeks</MenuItem>
                                            <MenuItem value={5}>Months</MenuItem>
                                            <MenuItem value={6}>Years</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                                {overlaySelectorButton}
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