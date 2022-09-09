import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import './map_style.css';

const TheWaterMap = ({
                   mapIsReadyCallback /* To be triggered when a map object is created */,
               }) => {
    const mapContainer = useRef(null);

    useEffect(() => {
        // const myAPIKey = 'd8a222a86303429e9c8ebbac9c9bdb95';
        // const mapStyle = 'https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat%3A-122.29009844646316%2C47.54607447032754&zoom=14.3497&marker=lonlat%3A-122.29188334609739%2C47.54403990655936%3Btype%3Aawesome%3Bcolor%3A%23bb3f73%3Bsize%3Ax-large%3Bicon%3Apaw%7Clonlat%3A-122.29282631194182%2C47.549609195001494%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome%7Clonlat%3A-122.28726954893025%2C47.541766557545884%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome&apiKey=d8a222a86303429e9c8ebbac9c9bdb95'
        //
        // const initialState = {
        //     lng: 87.5,
        //     lat: 33.2,
        //     zoom: 10,
        // };
        // const map = new Map({
        //     container: mapContainer.current,
        //     style: `${mapStyle}`,
        //     center: [initialState.lng, initialState.lat],
        //     zoom: initialState.zoom,
        // });

        const map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://maps.geoapify.com/v1/styles/osm-carto/style.json?apiKey=d8a222a86303429e9c8ebbac9c9bdb95',
        });

        mapIsReadyCallback(map);
    }, [mapIsReadyCallback]);

    return <div className="map-container" ref={mapContainer}></div>;
};

export default TheWaterMap;