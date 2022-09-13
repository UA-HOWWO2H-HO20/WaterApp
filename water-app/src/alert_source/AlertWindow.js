import React, {Component} from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import {Button, DialogContent} from "@material-ui/core";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogActions from "@material-ui/core/DialogActions";
import Dialog from "@material-ui/core/Dialog";

class AlertWindow extends React.Component {
    constructor({props, setStateReference}) {
        super(props);

        this.state = {
            open: false,
            headerText: "Something went wrong :/",
            errorText: "There was an unexpected issue"
        }

        this.setState = this.setState.bind(this)
        this.handleAlertClose = this.handleAlertClose.bind(this)

        // A workaround to give a handle to the setState method for the instance to the parent
        setStateReference(this.setState)
    }

    // Run by exit button
    async handleAlertClose() {
        this.setState({open: false})
        await new Promise(r => setTimeout(r, 200));
        this.setState({headerText: "Something went wrong :/", errorText: "There was an unexpected issue"})
    }

    render() {
        return (
            <Dialog open={this.state.open} onClose={this.handleAlertClose}>
                <DialogTitle>{this.state.headerText}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {this.state.errorText}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAlertClose} color="primary" >
                        Got it
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default AlertWindow