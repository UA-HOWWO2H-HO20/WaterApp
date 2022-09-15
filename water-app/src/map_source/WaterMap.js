import maplibregl from "maplibre-gl";
import React, {useEffect} from "react";

import "./map_style.css"

const WaterMap = ({initialLat,
                      initialLng,
                      initialZoom,
                      apiKey,
                      displayUserLocation}) => {
    // Declare objects before they are set
    let markerDot;

    // Create map
    useEffect(() => {
        let map = new maplibregl.Map({
            container: 'the-water-map',
            style: 'https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=' + apiKey,
            center: [initialLng, initialLat],
            zoom: initialZoom,
        });

        // Create map controls in top right
        map.addControl(new maplibregl.NavigationControl());

        if (displayUserLocation) {
            // If the user has entered a location, render a dot
            const markerDotSize = 12 * initialZoom;

            markerDot = {
                width: markerDotSize,
                height: markerDotSize,
                data: new Uint8Array(markerDotSize * markerDotSize * 4),

                // get rendering context for the map canvas when layer is added to the map
                onAdd: function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = this.width;
                    canvas.height = this.height;
                    this.context = canvas.getContext('2d');
                },

                // called once before every frame where the icon will be used
                render: function () {
                    const duration = 1000;
                    const t = (performance.now() % duration) / duration;

                    const radius = (markerDotSize / 2) * 0.3;
                    const outerRadius = (markerDotSize / 2) * 0.7 * t + radius;
                    const context = this.context;

                    // draw outer circle
                    context.clearRect(0, 0, this.width, this.height);
                    context.beginPath();
                    context.arc(
                        this.width / 2,
                        this.height / 2,
                        outerRadius,
                        0,
                        Math.PI * 2
                    );
                    context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                    context.fill();

                    // draw inner circle
                    context.beginPath();
                    context.arc(
                        this.width / 2,
                        this.height / 2,
                        radius,
                        0,
                        Math.PI * 2
                    );
                    context.fillStyle = 'rgba(255, 100, 100, 1)';
                    context.strokeStyle = 'white';
                    context.lineWidth = 2 + 4 * (1 - t);
                    context.fill();
                    context.stroke();

                    // update this image's data with data from the canvas
                    this.data = context.getImageData(
                        0,
                        0,
                        this.width,
                        this.height
                    ).data;

                    // continuously repaint the map, resulting in the smooth animation of the dot
                    map.triggerRepaint();

                    // return `true` to let the map know that the image was updated
                    return true;
                }
            };
        }

        map.on('load', function () {
            if(displayUserLocation)
            {
                map.addImage('pulsing-dot', markerDot, { pixelRatio: 2 });

                map.addSource('points', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [initialLng, initialLat]
                                }
                            }
                        ]
                    }
                });
                map.addLayer({
                    'id': 'points',
                    'type': 'symbol',
                    'source': 'points',
                    'layout': {
                        'icon-image': 'pulsing-dot'
                    }
                });
            }
        });
    });

    return <div id="the-water-map"></div>;
};

export default WaterMap