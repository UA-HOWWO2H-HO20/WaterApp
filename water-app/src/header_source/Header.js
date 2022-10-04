import "./header_style.css"
import React from "react";

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
                        <h4>Brought to you by HOWWO2H-HO20</h4>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>)
    }
}

export default Header;