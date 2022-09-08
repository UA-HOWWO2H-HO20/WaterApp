import React, { useEffect, useRef } from 'react';
import { Map } from 'maplibre-gl';
import './map_style.css';

const TheWaterMap = ({
                   mapIsReadyCallback /* To be triggered when a map object is created */,
               }) => {
    const mapContainer = useRef(null);

    useEffect(() => {
        const myAPIKey = '0a398cc08839490f95fc422b750edc75';
        const mapStyle = 'https://maps.geoapify.com/v1/styles/dark-matter/style.json';

        const initialState = {
            lng: 11,
            lat: 49,
            zoom: 4,
        };

        const map = new Map({
            container: mapContainer.current,
            style: `${mapStyle}?apiKey=${myAPIKey}`,
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom,
        });

        mapIsReadyCallback(map);
    }, [mapIsReadyCallback]);

    return <div className="map-container" ref={mapContainer}></div>;
};

export default TheWaterMap;