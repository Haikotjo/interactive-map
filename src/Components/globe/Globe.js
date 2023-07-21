import React from 'react';
import Globe from 'react-globe.gl';

function MyGlobe() {
    return (
        <Globe
            globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
            bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"

        />
    );
}

export default MyGlobe;
