import React from "react";

class Footer extends React.Component {
    render() {
        return (
            <div id={"water-app-footer"}>
                <table className={"footer-table"}>
                    <tbody>
                        <tr>
                            <td className={"footer-td"}>
                                <p>About this project</p>
                            </td>
                            <td className={"footer-td"}>
                                <p>Sources</p>
                            </td>
                            <td className={"footer-td"}>
                                <p>Check connection</p>
                            </td>
                            <td className={"footer-td"}>
                                <p>View source code</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        )
    }
}

export default Footer;