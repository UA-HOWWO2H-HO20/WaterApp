import "./App.css";
import WaterMap from "./map_source/WaterMap";
import Header from "./header_source/Header";
import RenderRain from "./rain_source/RenderRain";

function App() {
    // Coordinates for tuscaloosa
    const initialState = {
        lng: -86.9,
        lat: 32.3,
        zoom: 7
    }

  return (
    <div className="App">
        <body>
            <Header />
            <div className={"map-container"}>
                <WaterMap initialLat={initialState.lat} initialLng={initialState.lng} initialZoom={initialState.zoom}/>
                <RenderRain />
            </div>
        </body>
    </div>
  );
}

export default App;
