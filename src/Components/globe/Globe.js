import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson';
import { fetchData, createCountryPaths, createGlobeZoom, createGlobeDrag } from '../../helpers/helpers';

function Globe() {
    const ref = useRef();
    const pathRef = useRef();
    const projectionRef = useRef();

    useEffect(() => {
        const processMapData = async () => {
            const data = await fetchData(process.env.PUBLIC_URL + '/countries-50m.json');
            const countries = feature(data, data.objects.countries);

            const svg = d3.select(ref.current);
            const width = svg.node()?.getBoundingClientRect()?.width;
            const height = width;

            if (!width) return;

            svg.attr('viewBox', `0 0 ${width} ${height}`);

            const projection = d3.geoOrthographic()
                .fitSize([width, height], countries);

            const path = d3.geoPath(projection);

            const g = svg.append('g');

            const dummyColorScale = d3.scaleOrdinal().range(['lightgray', 'lightgray']);

            const updatePaths = createCountryPaths(countries, dummyColorScale, /* dummy fetchCountryData function */ () => {}, projection);

            // Verwijder alle elementen binnen de 'g'-groep voordat nieuwe elementen worden toegevoegd
            g.selectAll('*').remove();

            g.selectAll('path')
                .data(countries.features)
                .join('path')
                .call(updatePaths);

            createGlobeZoom(svg, projection, path, g);
            createGlobeDrag(projection, path, g);

            projectionRef.current = projection;
            pathRef.current = path;
        };

        processMapData();
    }, []);

    useEffect(() => {
        const svg = d3.select(ref.current);
        const g = svg.select('g');
        const path = pathRef.current;
        const projection = projectionRef.current;

        if (!path || !projection) return;

        g.selectAll('path')
            .attr('d', path);

        svg.call(createGlobeZoom(svg, projection, path, g));
        svg.call(createGlobeDrag(projection, path, g));
    }, []);

    return (
        <svg ref={ref} style={{ width: '100%', height: '100%' }} />
    );
}

export default Globe;
