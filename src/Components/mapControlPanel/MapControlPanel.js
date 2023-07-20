import React, { useState } from 'react';
import WorldMap from './WorldMap';
import MapControlPanel from './MapControlPanel';

function App() {
    const [selectedData, setSelectedData] = useState([]);

    const handleDataSelectionChange = (newSelection) => {
        setSelectedData(newSelection);
    };

    return (
        <div>
            <MapControlPanel selectedData={selectedData} onSelectionChange={handleDataSelectionChange} />
            <WorldMap dataFiles={selectedData} />
        </div>
    );
}

export default App;
