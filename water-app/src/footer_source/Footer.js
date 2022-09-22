import React from "react";
import AlertWindow from "../alert_source/AlertWindow";

import "./footer_style.css"

class Footer extends React.Component {
    constructor(props) {
        super(props);

        this.setAlertCallback = (func) => { this.alertSetStateReference = func }
        this.alertSetStateReference = () => {}

        this.aboutHeader = "About this project"
        this.aboutText = "\tThe water app was created by a team of undergraduate computer science students at the The University of Alabama, as a senior design project. This app was created in collaboration with the Alabama Water Institute, who are responsible for its development and maintenance."
        this.sourcesHeader = "Data sources"
        this.sourcesText ="Insert sources here"
    }

    render() {
        return (
            <div id={"water-app-footer"}>
                <table className={"footer-table"}>
                    <tbody>
                        <tr>
                            <td className={"footer-td"}>
                                <p className={"footer-label"} onClick={() => { this.alertSetStateReference({open: true, headerText: this.aboutHeader, errorText: this.aboutText }) } }>About this project</p>
                            </td>
                            <td className={"footer-td"}>
                                <p className={"footer-label"} onClick={() => { this.alertSetStateReference({open: true, headerText: this.sourcesHeader, errorText: this.sourcesText }) } }>Sources</p>
                            </td>
                            <td className={"footer-td"}>
                                <a className={"footer-label"} href={"https://github.com/andyhansen7/WaterApp"} >View source code</a>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <AlertWindow setStateReference={this.setAlertCallback} />
            </div>
        )
    }
}

export default Footer;