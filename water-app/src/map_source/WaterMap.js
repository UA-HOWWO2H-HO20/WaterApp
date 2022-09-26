import maplibregl from "maplibre-gl";
import React, {useContext, useEffect} from "react";
import ReactDOM from "react-dom";

import "./map_style.css"

class WaterMap extends React.Component {
    constructor({props,
                 initialLat,
                 initialLng,
                 initialZoom,
                 apiKey}) {
        super(props);

        this.apiKey = apiKey;

        this.state = {
            lat: initialLat,
            lng: initialLng,
            zoom: initialZoom,
            displayMarkerDot: true
        };

        // Declare components for overlays
        this.markerDot = {};
        this.markerDotImageLoaded = false;

        this.setState = this.setState.bind(this);
        this.renderMap = this.renderMap.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.componentWillUnmount = this.componentWillUnmount.bind(this);
        this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
        this.createComponents = this.createComponents.bind(this);
    }

    createComponents (map) {
        // If the user has entered a location, render a dot
        const markerDotSize = 12 * this.state.zoom;

        this.markerDot = {
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

    // Helper that will render the map. Will be run when state is updated
    renderMap() {
        let map = new maplibregl.Map({
            container: 'the-water-map',
            style: 'https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=' + this.apiKey,
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
        });

        // Create map controls in top right
        map.addControl(new maplibregl.NavigationControl());

        // Create component items
        this.createComponents(map);

        let context = this;

        map.on('load', function () {
            if(context.state.displayMarkerDot)
            {
                map.addImage('pulsing-dot', context.markerDot, { pixelRatio: 2 });
                context.markerDotImageLoaded = true;

                map.addSource('points', {
                    'type': 'geojson',
                    'data': {
                        'type': 'FeatureCollection',
                        'features': [
                            {
                                'type': 'Feature',
                                'geometry': {
                                    'type': 'Point',
                                    'coordinates': [context.state.lng, context.state.lat]
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
        }, );
    }

    handleMarkerDotEvent = () => {
        this.setState({displayMarkerDot: !this.state.displayMarkerDot}, () => { this.renderMap(); });
    }

    handleLocationSearchEvent = (event) => {
        this.setState({lat: event.detail.lat, lng: event.detail.lng}, () => { this.renderMap(); });
    }

    componentDidMount() {
        this.renderMap();

        // Create event listeners
        document.addEventListener('toggle-marker-dot', this.handleMarkerDotEvent);
        document.addEventListener('location-search', this.handleLocationSearchEvent);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }

    componentWillUnmount() {
        // Remove event listeners
        document.removeEventListener('toggle-marker-dot', this.handleMarkerDotEvent);
        document.removeEventListener('location-search', this.handleLocationSearchEvent);
    }

    render() {
        return <div id="the-water-map"></div>;
    }
}

export default WaterMap;