import React, {useEffect, useRef, useState} from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson';
import CountryModal from "../countryModal/CountryModal";

function WorldMap() {
    const [show, setShow] = useState(false);
    const [countryData, setCountryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const filenames = [
        "/mapData/ne_10m_antarctic_ice_shelves_lines.json",
        "/mapData/ne_10m_antarctic_ice_shelves_polys.json",
        "/mapData/ne_10m_bathymetry_A_10000.json",
        "/mapData/ne_10m_bathymetry_B_9000.json",
        "/mapData/ne_10m_bathymetry_C_8000.json",
        "/mapData/ne_10m_bathymetry_D_7000.json",
        "/mapData/ne_10m_bathymetry_E_6000.json",
        "/mapData/ne_10m_bathymetry_F_5000.json",
        "/mapData/ne_10m_bathymetry_G_4000.json",
        "/mapData/ne_10m_bathymetry_H_3000.json",
        "/mapData/ne_10m_bathymetry_I_2000.json",
        "/mapData/ne_10m_bathymetry_J_1000.json",
        "/mapData/ne_10m_bathymetry_K_200.json",
        "/mapData/ne_10m_bathymetry_L_0.json",
        "/mapData/ne_10m_coastline.json",
        "/mapData/ne_10m_geographic_lines.json",
        "/mapData/ne_10m_geography_marine_polys.json",
        "/mapData/ne_10m_geography_regions_elevation_points.json",
        "/mapData/ne_10m_geography_regions_points.json",
        "/mapData/ne_10m_geography_regions_polys.json",
        "/mapData/ne_10m_glaciated_areas.json",
        "/mapData/ne_10m_graticules_1.json",
        "/mapData/ne_10m_graticules_5.json",
        "/mapData/ne_10m_graticules_10.json",
        "/mapData/ne_10m_graticules_15.json",
        "/mapData/ne_10m_graticules_20.json",
        "/mapData/ne_10m_graticules_30.json",
        "/mapData/ne_10m_lakes.json",
        "/mapData/ne_10m_lakes_australia.json",
        "/mapData/ne_10m_lakes_europe.json",
        "/mapData/ne_10m_lakes_historic.json",
        "/mapData/ne_10m_lakes_north_america.json",
        "/mapData/ne_10m_lakes_pluvial.json",
        "/mapData/ne_10m_land.json",
        "/mapData/ne_10m_land_ocean_label_points.json",
        "/mapData/ne_10m_land_ocean_seams.json",
        "/mapData/ne_10m_land_scale_rank.json",
        "/mapData/ne_10m_minor_islands.json",
        "/mapData/ne_10m_minor_islands_coastline.json",
        "/mapData/ne_10m_minor_islands_label_points.json",
        "/mapData/ne_10m_ocean.json",
        "/mapData/ne_10m_ocean_scale_rank.json",
        "/mapData/ne_10m_playas.json",
        "/mapData/ne_10m_populated_places.json",
        "/mapData/ne_10m_reefs.json",
        "/mapData/ne_10m_rivers_australia.json",
        "/mapData/ne_10m_rivers_europe.json",
        "/mapData/ne_10m_rivers_lake_centerlines.json",
        "/mapData/ne_10m_rivers_lake_centerlines_scale_rank.json",
        "/mapData/ne_10m_rivers_north_america.json",
        "/mapData/ne_10m_wgs84_bounding_box.json"
    ];

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const ref = useRef();

    useEffect(() => {
        fetch(process.env.PUBLIC_URL + '/countries-50m.json')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                const myColors = ["#FF6F59", "#ff4466", "#00ffb2", "#9267ff", "#98DFEA", "#950952", "#0AB6FF", "#FF2ECC", "#00d1ff"];
                const colorScale = d3.scaleOrdinal(myColors);

                const countries = feature(data, data.objects.countries);

                const svg = d3.select(ref.current);

                const width = svg.node().getBoundingClientRect().width;
                const height = width * 0.6;

                const projection = d3.geoMercator().fitSize([width, height], countries);

                const path = d3.geoPath(projection);

                svg.attr('viewBox', `0 0 ${width} ${height}`);

                const g = svg.append('g');

                const rect = g.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', 'white');

                g.selectAll('path')
                    .data(countries.features)
                    .join('path')
                    .attr('d', path)
                    .attr('fill', d => colorScale(d.properties.name))
                    .attr('stroke', '#333')
                    .attr('stroke-width', 0.5)
                    .on('click', function(event, d) {
                        setIsLoading(true);

                        fetch(`https://restcountries.com/v3.1/name/${d.properties.name}`)
                            .then(response => response.json())
                            .then(data => {
                                setCountryData(data[0]);
                                setIsLoading(false);
                                handleShow();
                            })
                            .catch(error => {
                                console.error('Fout bij het laden van de landgegevens:', error);
                                setIsLoading(false);
                            });
                    })
                    .on('mouseover', function(event, d) {
                        d3.select(this)
                            .attr('fill', d => d3.rgb(colorScale(d.properties.name)).brighter(0.5))
                            .attr('stroke', d => colorScale(d.properties.name));
                    })
                    .on('mouseout', function(event, d) {
                        d3.select(this)
                            .attr('fill', d => colorScale(d.properties.name))
                            .attr('stroke', '#333');
                    });

                fetch(process.env.PUBLIC_URL + '/mapData/ne_10m_rivers_north_america.json')
                    .then(response => response.json())
                    .then(riverData => {
                        console.log("Topology data:", riverData); //log the data structure

                        const rivers = riverData.geometries;
                        g.selectAll('path.river')
                            .data(rivers)
                            .join('path')
                            .attr('class', 'river')
                            .attr('d', path)
                            .attr('fill', 'none')
                            .attr('stroke', '#0000ff')
                            .attr('stroke-width', 0.5);
                    })
                    .catch(error => console.error('Fout bij het laden van ne_10m_rivers_north_america.json:', error));

                const zoom = d3.zoom()
                    .scaleExtent([1, 30])
                    .on('zoom', (event) => {
                        let x = event.transform.x;
                        let y = event.transform.y;
                        x = Math.min((width / height) * (event.transform.k - 1), Math.max(width * (1 - event.transform.k), x));
                        y = Math.min(0, Math.max(height * (1 - event.transform.k), y));
                        g.attr('transform', `translate(${x},${y}) scale(${event.transform.k})`);
                    });

                svg.call(zoom);

                window.addEventListener('resize', () => {
                    const newWidth = svg.node().getBoundingClientRect().width;
                    const newHeight = newWidth * 0.6;

                    rect.attr('width', newWidth).attr('height', newHeight);

                    projection.fitSize([newWidth, newHeight], countries);

                    g.selectAll('path').attr('d', path);
                });

            })
            .catch(error => console.error('Fout bij het laden van landen-50m.json:', error));
    }, []);


    return (
        <>
            <svg ref={ref} style={{ width: '100%', height: 'auto' }} />
            <CountryModal show={show} handleClose={handleClose} countryData={countryData} isLoading={isLoading} />
        </>
    );
}

export default WorldMap;
