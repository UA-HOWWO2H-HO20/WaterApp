import './App.css';
import maplibregl from "maplibre-gl";
import {useEffect} from "react";

function App() {
    const initialState = {
        lng: -86.9,
        lat: 32.3,
        zoom: 7
    }

    useEffect(() => {
        let map = new maplibregl.Map({
            container: 'the-water-map',
            style: 'https://maps.geoapify.com/v1/styles/dark-matter-brown/style.json?apiKey=d8a222a86303429e9c8ebbac9c9bdb95',
            center: [initialState.lng, initialState.lat],
            zoom: initialState.zoom,
        });
        map.addControl(new maplibregl.NavigationControl());
    });

  return (
    <div className="App">
        <div id="the-water-map"></div>
    </div>
  );
}

export default App;
