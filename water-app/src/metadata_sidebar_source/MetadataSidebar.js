import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import {Button} from "@mui/material";
import AutorenewIcon from '@mui/icons-material/Autorenew';

class MetadataSidebar extends React.Component {
    constructor(props) {
        super(props);

        this.headCells = [
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

        // Store the current row selection from the table
        this.selectedRows = [];

        // Store whether we are currently refreshing so button can display the logo
        this.state = {inRefresh: false};

        this.setState = this.setState.bind(this);
        this.getMetadata = this.getMetadata.bind(this);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleRowSelect = this.handleRowSelect.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
    }

    componentDidMount() {
        // Add listener to unlock the button after data refresh
        window.addEventListener('data-loaded', () => { this.setState({inRefresh: false}); });
    }

    componentWillUnmount() {
        // Remove event listener
        window.removeEventListener('data-loaded', () => { this.setState({inRefresh: false}); });
    }

    getMetadata() {
        // TODO: load from server using requests
        return [
            {
                id: 1,
                overlay_name: 'Population Density by State',
                start_date: new Date().toString(),
                end_date: new Date().toString()
            },
            {
                id: 2,
                overlay_name: 'Radar Data',
                start_date: new Date().toString(),
                end_date: new Date().toString()
        }];
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
        const rows = this.getMetadata();
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

export default MetadataSidebar;