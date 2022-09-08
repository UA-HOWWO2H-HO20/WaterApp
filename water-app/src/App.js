import './App.css';
import TheWaterMap from "./map_source/TheWaterMap";

function App() {
    const mapIsReadyCallback = (map) => {
        console.log(map);
    };

  return (
    <div className="App">
      {/*<header className="App-header">*/}
      {/*  <p>*/}
      {/*    The Water App - V0.0.0*/}
      {/*  </p>*/}
      {/*</header>*/}
      <TheWaterMap mapIsReadyCallback={mapIsReadyCallback}/>
    </div>
  );
}

export default App;
