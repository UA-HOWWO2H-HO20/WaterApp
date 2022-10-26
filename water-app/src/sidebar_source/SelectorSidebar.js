import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {Button} from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';

class SelectorSidebar extends React.Component {
    constructor(props) {
        super(props);


    }

    componentDidMount() {
        // Add listener to unlock the button after data refresh
        window.addEventListener('data-loaded', async () => {
            // Okay this isn't my proudest moment, but if the map sends a response too fast this will never update the state
            // A tiny delay usually ensures the state update takes effect so the selector unlocks no matter how quick the response is
            await new Promise(r => setTimeout(r, 10))

            this.setState({inRefresh: false});
        });

        // Add listener for metadata published by the server requester
        window.addEventListener('metadata-event', (event) => {
            this.setState({rowData: event.detail});
            console.log('Sidebar received metadata from server');
        });
    }

    componentWillUnmount() {
        // Remove event listeners
        // window.removeEventListener('data-loaded', () => { this.setState({inRefresh: false}); });
        // window.removeEventListener('metadata-event', (event) => {
        //     this.setState({rowData: event.detail});
        //     console.log('Sidebar received metadata from server');
        // });
    }

    handleButtonClick() {
        const event = new CustomEvent('data-refresh', { detail: this.selectedRows });
        dispatchEvent(event);

        this.setState({inRefresh: true});
    }

    handleRowSelect(data) {
        this.selectedRows = data;
    }

    render() {
        // Fetch server data
        const rows = this.state.rowData;
        const columns = this.headCells;

        let button;

        // Create button object
        if(this.state.inRefresh)
        {
            button = <Button id="data-grid-button" variant="contained" disabled={true} startIcon={<AutorenewIcon />}>Fetching data...</Button>;
        }
        else
        {
            button = <Button id="data-grid-button" variant="contained" onClick={() => { this.handleButtonClick(); }}>Fetch Data</Button>;
        }

        return (
            <Stack spacing={2}>
                <Box sx={{ height: '75vh', width: '20vw' }}>
                    <DataGrid id="data-grid"
                              rows={rows}
                              columns={columns}
                              pageSize={10}
                              hideFooterPagination
                              checkboxSelection
                              onSelectionModelChange={(data) => {
                                  this.handleRowSelect(data);
                              }}
                    />
                </Box>
                {button}
            </Stack>
        )
    }
}

export default SelectorSidebar;