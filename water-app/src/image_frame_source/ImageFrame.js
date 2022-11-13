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
            maxFrame: 2,
            currentFrame: 0,
            running: false,
            imagesLoaded: false,
            inOverlayRefresh: false,
            imageMetadata: [],
            selectionStartDate: new Date(),
            selectionEndDate: new Date(),
            selectionBBoxXMin: 0.0,
            selectionBBoxXMax: 0.0,
            selectionBBoxYMin: 0.0,
            selectionBBoxYMax: 0.0,
            selectionBBoxXMinValue: 0.0,
            selectionBBoxXMaxValue: 0.0,
            selectionBBoxYMinValue: 0.0,
            selectionBBoxYMaxValue: 0.0,
            startDateValue: new Date(),
            endDateValue: new Date(),
            playbackFPS: 2,
            selectedOverlayRows: [],
            timeStepValue: 1,
            timeStepPeriod: 2,
            useAllImageFrames: false,
        };

        // Head cells for metadata
        this.metadataHeadCells = [
            {
                field: 'title',
                headerName: 'Layer Name',
                sortable: false,
                width: 160
            },
            {
                field: 'start_date',
                headerName: 'Start Date',
                sortable: false,
                width: 250
            },
            {
                field: 'end_date',
                headerName: 'End Date',
                sortable: false,
                width: 250
            },
            {
                field: 'bbox_xmin',
                headerName: 'XMin',
                sortable: false,
                width: 80
            },
            {
                field: 'bbox_xmax',
                headerName: 'XMax',
                sortable: false,
                width: 80
            },
            {
                field: 'bbox_ymin',
                headerName: 'YMin',
                sortable: false,
                width: 80
            },
            {
                field: 'bbox_ymax',
                headerName: 'YMax',
                sortable: false,
                width: 80
            }];

        // Original image sources for initial animation
        this.imageSources = [];

        // Cached image objects
        this.cachedImageObjects = [];

        // Create a server requester object
        this.requester = new ServerRequester();

        // URL of image to be shown if data has not loaded yet.
        // This is a site with an API to create placeholder images, good enough for our purposes.
        // This could be replaced with some other image later on if needed.
        this.dataNotLoadedBackground = "https://via.placeholder.com/720x720.jpeg?text=Fetching data from server...";

        // Bindings
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
        this.cachedImageObjects = [];

        Promise.all(
            this.imageSources.map(this.cacheImage)
        ).then(() => {
            this.setState({ imagesLoaded: true });
            console.log(`Successfully loaded ${this.imageSources.length} image sources`);
        }, () => {
            console.error('Failed to load images');
        });           
    }

    // Helper to cache images in the browser, which speeds up loading time
    cacheImage(path) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                this.cachedImageObjects.push(img);
                resolve(path);
            }
            img.onerror = () => reject();
            img.src = path;
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
        // let image = new Image();
        // image.src = this.imageSources.at(imageIndex);
        let image = this.cachedImageObjects.at(imageIndex);

        if(!image)
        {
            console.log(`Failed to render image: ${this.imageSources.at(imageIndex)}`)
            return new Promise((r) => {r()});
        }

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
        return new Promise((r) => {r()});
    }

    // Helper to run the render method and switch between static or running
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

    // Runs when component is rendered
    componentDidMount() {
        // Begin the initial metadata fetch
        this.requester.fetchMetaDataFromServer().then((result) => {
            console.log('Metadata fetch completed by requester.');

            // Display the first layer
            this.handleInitialDataFetch(result)

            // Save the metadata locally
            this.setState({imageMetadata: result});

            // Start an interval to display the data
            this.displayInterval = setInterval(this.displayData, (1000 / this.state.playbackFPS));
        });
    }

    // Runs before component is removed from the screen
    componentWillUnmount() {
        // Clear display interval
        clearInterval(this.displayInterval);
    }

    // Updates the state to stop the animation when the user selects a bubble on the screen
    handleSliderInput(newValue) {
        this.setState({running: false, currentFrame: newValue - 1});
    }

    // Toggles whether the animation is running when icon is pressed
    handlePlayButtonClick() {
        const oldState = this.state.running;
        this.setState({running: !oldState});
    }

    // Requests new data from the server when the fetch button is pressed
    handleOverlayButtonClick() {
        console.log('in request processor')

        // Start the call to lock the button from being pressed
        this.setState({inRefresh: true});

        // Load the new image sources
        this.imageSources = this.requester.getImageURLsFromSelection(this.state.selectedOverlayRows, this.state.imageMetadata, this.state.timeStepValue, this.state.timeStepPeriod, this.state.startDateValue, this.state.endDateValue, this.state.useAllImageFrames);

        // Load the images and re-render
        this.loadImages();

        // Unlock the selector
        this.setState({inRefresh: false, maxFrame: this.imageSources.length - 1});
    }

    // Runs the initial fetch after the metadata is loaded so something is playing
    handleInitialDataFetch(metadata) {
        // The first layer will be defaulted to running when the animation starts
        const initialLayerToShow = 0;

        const selectedRows = [];
        selectedRows.push(initialLayerToShow);

        // Load the layer info
        let startDate = new Date(), endDate = new Date();
        let xMin = 0, yMin = 0, xMax = 0, yMax = 0;
        for(const layer of metadata) {
            if(layer.id === initialLayerToShow) {
                startDate = new Date(layer.start_date);
                endDate = new Date(layer.end_date);
                xMin = layer.bbox_xmin === 'N/A' ? 0.0 : layer.bbox_xmin;
                xMax = layer.bbox_xmax === 'N/A' ? 0.0 : layer.bbox_xmax;
                yMin = layer.bbox_ymin === 'N/A' ? 0.0 : layer.bbox_ymin;
                yMax = layer.bbox_ymax === 'N/A' ? 0.0 : layer.bbox_ymax;
            }
        }

        console.log(`Start: ${startDate}`);
        console.log(`End: ${endDate}`);

        // Update the initial state variables
        this.setState({inRefresh: true,
            useAllImageFrames: true,
            selectedOverlayRows: selectedRows,
            selectionStartDate: startDate,
            startDateValue: startDate,
            selectionEndDate: endDate,
            endDateValue: endDate,
            selectionBBoxXMin: xMin,
            selectionBBoxXMax: xMax,
            selectionBBoxYMin: yMin,
            selectionBBoxYMax: yMax,
            selectionBBoxXMinValue: xMin,
            selectionBBoxXMaxValue: xMax,
            selectionBBoxYMinValue: yMin,
            selectionBBoxYMaxValue: yMax,
        });

        // Run the render
        // Note: have to use constants or initialized values for this because the setState method is so slow
        this.imageSources = this.requester.getImageURLsFromSelection(selectedRows, metadata, 1, 1, startDate, endDate, true);

        // Load the images and re-render
        this.loadImages();

        // Unlock the selector
        this.setState({inRefresh: false, maxFrame: this.imageSources.length - 1, running: true});
    }

    // Runs when a row is selected to update some state variables
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

        // Load the bounding box values
        let minX = 0.0;
        let maxX = 0.0;
        let minY = 0.0;
        let maxY = 0.0;

        data.forEach((index) => {
            let item;

            for(let j = 0; j < this.state.imageMetadata.length; j++) {
                const candidate = this.state.imageMetadata.at(j);

                if(candidate.id === index) {
                    item = candidate;
                    break;
                }
            }

            if(item.bbox_xmin !== 'N/A' && item.bbox_xmin < minX)
                minX = item.bbox_xmin
            if(item.bbox_xmax !== 'N/A' && item.bbox_xmax > maxX)
                maxX = item.bbox_xmax
            if(item.bbox_ymin !== 'N/A' && item.bbox_ymin < minY)
                minY = item.bbox_ymin
            if(item.bbox_ymax !== 'N/A' && item.bbox_ymax > maxY)
                maxY = item.bbox_ymax
        });

        this.setState({ selectionStartDate: maxStartTime,
            selectionEndDate: minEndTime,
            startDateValue: maxStartTime,
            endDateValue: minEndTime,
            selectionBBoxXMin: minX,
            selectionBBoxXMax: maxX,
            selectionBBoxYMin: minY,
            selectionBBoxYMax: maxY,
            selectionBBoxXMinValue: minX,
            selectionBBoxXMaxValue: maxX,
            selectionBBoxYMinValue: minY,
            selectionBBoxYMaxValue: maxY,
        });

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
            overlaySelectorButton = <Button id="metadata-grid-button" variant="contained" onClick={() => { this.handleOverlayButtonClick(); }}>Fetch Data</Button>;
        }

        return (
            <div className={"map-container"}>
                <table className={"map-table"}>
                    <tbody>
                    <tr>
                        <td className={"map-sidebar-td"}>
                            <Box sx={{ height: '90vh', width: '20vw' }}>
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
                            <Stack sx={{ height: '87vh', width: '20vw' }} spacing={2} alignItems="stretch" justifyContent="flex-start">
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
                                <div className={"user-controls-spacing-div"}>
                                    <p></p>
                                </div>
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
                                <div className={"user-controls-spacing-div"}>
                                    <p></p>
                                </div>
                                <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="stretch">
                                    <TextField className="time-step-selector-box"
                                               label={"Time step"}
                                               type="number"
                                               value={this.state.timeStepValue}
                                               disabled={this.state.useAllImageFrames}
                                               InputProps={{ inputProps: { min: 0, max: 10 } }}
                                               onChange={(event) => {
                                                   this.setState({timeStepValue: event.target.value});
                                               }}
                                    />
                                    <FormControl style={{minWidth: 120}} disabled={this.state.useAllImageFrames}>
                                        <InputLabel id="interval-selection-label">Interval</InputLabel>
                                        <Select
                                            labelId="interval-selection-label"
                                            id="interval-selection-field"
                                            value={this.state.timeStepPeriod}
                                            label="Select"
                                            onChange={(event) => {
                                                this.setState({timeStepPeriod: event.target.value});
                                            }}
                                        >
                                            <MenuItem value={1}>Minutes</MenuItem>
                                            <MenuItem value={2}>Hours</MenuItem>
                                            <MenuItem value={3}>Days</MenuItem>
                                            <MenuItem value={4}>Weeks</MenuItem>
                                            <MenuItem value={5}>Months</MenuItem>
                                            <MenuItem value={6}>Years</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <Button className={"use-all-frames-selector-button"}
                                        variant={this.state.useAllImageFrames ? "outlined" : "contained"}
                                        color="primary"
                                        onClick={() => {
                                            // Update the state
                                            this.setState({useAllImageFrames: !this.state.useAllImageFrames});
                                        }}>
                                    Use all valid timestamps
                                </Button>
                                <div className={"user-controls-spacing-div"}>
                                    <p></p>
                                </div>
                                <Stack direction="row" spacing={2} justifyContent="space-evenly" alignItems="center">
                                    <TextField style={{minWidth: 150}}
                                               className="bbox-selector"
                                               label={"Lower X Bound"}
                                               type="number"
                                               value={this.state.selectionBBoxXMinValue}
                                               InputProps={{ inputProps: { min: this.state.selectionBBoxXMin, max: this.state.selectionBBoxXMaxValue } }}
                                               onChange={(event) => {
                                                   this.setState({selectionBBoxXMin: event.target.value});
                                               }}
                                    />
                                    <TextField style={{minWidth: 150}}
                                               className="bbox-selector"
                                               label={"Upper X Bound"}
                                               type="number"
                                               value={this.state.selectionBBoxXMaxValue}
                                               InputProps={{ inputProps: { min: this.state.selectionBBoxXMinValue, max: this.state.selectionBBoxXMax } }}
                                               onChange={(event) => {
                                                   this.setState({selectionBBoxXMax: event.target.value});
                                               }}
                                    />
                                </Stack>
                                <Stack direction="row" spacing={2} justifyContent="space-evenly" alignItems="center">
                                    <TextField style={{minWidth: 150}}
                                               className="bbox-selector"
                                               label={"Lower Y Bound"}
                                               type="number"
                                               value={this.state.selectionBBoxYMinValue}
                                               InputProps={{ inputProps: { min: this.state.selectionBBoxYMin, max: this.state.selectionBBoxYMaxValue } }}
                                               onChange={(event) => {
                                                   this.setState({selectionBBoxYMin: event.target.value});
                                               }}
                                    />
                                    <TextField style={{minWidth: 150}}
                                               className="bbox-selector"
                                               label={"Upper Y Bound"}
                                               type="number"
                                               value={this.state.selectionBBoxYMaxValue}
                                               InputProps={{ inputProps: { min: this.state.selectionBBoxYMinValue, max: this.state.selectionBBoxYMax } }}
                                               onChange={(event) => {
                                                   this.setState({selectionBBoxYMax: event.target.value});
                                               }}
                                    />
                                </Stack>
                                <div className={"user-controls-spacing-div"}>
                                    <p></p>
                                </div>
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