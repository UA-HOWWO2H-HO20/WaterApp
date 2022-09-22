import React, {Component} from "react";

import "./overlay_selector_style.css"

import location from './location_favicon.svg';

class OverlaySelector extends React.Component {
    constructor({props, locationClickFunction}) {
        super(props);

        this.locationClickFunction = locationClickFunction

    }

    render() {
        return (
            <div className={"overlay-selector-container"} >
                <table className={"overlay-selector-table"}>
                    <tbody>
                        <tr className={"overlay-selector-tr"} >
                            <td className={"overlay-selector-td"}>
                                <img src={location} alt={"Your location"} onClick={() => {this.locationClickFunction()}}></img>
                            </td>
                        </tr>

                        {/*TODO: add these back as more overlays are defined*/}
                        {/*<tr className={"overlay-selector-tr"} >*/}
                        {/*    <td className={"overlay-selector-td"}>*/}
                        {/*        2*/}
                        {/*    </td>*/}
                        {/*</tr>*/}
                        {/*<tr className={"overlay-selector-tr"} >*/}
                        {/*    <td className={"overlay-selector-td"}>*/}
                        {/*        3*/}
                        {/*    </td>*/}
                        {/*</tr>*/}
                        {/*<tr className={"overlay-selector-tr"} >*/}
                        {/*    <td className={"overlay-selector-td"}>*/}
                        {/*        4*/}
                        {/*    </td>*/}
                        {/*</tr>*/}
                    </tbody>
                </table>
            </div>)
    }
}

export default OverlaySelector