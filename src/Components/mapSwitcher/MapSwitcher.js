import React, { useState } from 'react';
import Globe from "../globe/Globe";
import WorldMap from "../worldMap/WorldMap";


function MapSwitcher() {
    const [showGlobe, setShowGlobe] = useState(false);

    return (
        <div>
            <button onClick={() => setShowGlobe(!showGlobe)}>
                Switch to {showGlobe ? 'Map' : 'Globe'}
            </button>
            {showGlobe ? <Globe /> : <WorldMap />}
        </div>
    );
}

export default MapSwitcher;
