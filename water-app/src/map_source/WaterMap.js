import maplibregl from "maplibre-gl";
import {useEffect} from "react";

import "./map_style.css"

const WaterMap = ({initialLat, initialLng, initialZoom}) => {
    useEffect(() => {
        let map = new maplibregl.Map({
            container: 'the-water-map',
            style: 'https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=d8a222a86303429e9c8ebbac9c9bdb95',
            center: [initialLng, initialLat],
            zoom: initialZoom,
        });

        map.addControl(new maplibregl.NavigationControl());
    });

    return <div id="the-water-map"></div>;
};
export default WaterMap