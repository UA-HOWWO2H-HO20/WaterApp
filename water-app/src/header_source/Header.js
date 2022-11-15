import "./header_style.css"
import React from "react";
import AWILogo from "./awi.png";

class Header extends React.Component {
    render() {
        return (<div id={"water-app-header"}>
            <table className={"header-table"}>
                <tbody>
                <tr>
                    <td className={"header-td"}>
                        <h1>floviz</h1>
                    </td>
                    <td className={"header-td"}>
                        <p></p>
                    </td>
                    <td className={"header-td"}>
                        <img src={AWILogo} alt={""} className={"header-thumbnail"} />
                    </td>
                </tr>
                </tbody>
            </table>
        </div>)
    }
}

export default Header;