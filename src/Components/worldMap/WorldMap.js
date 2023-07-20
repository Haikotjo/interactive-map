import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { feature } from 'topojson';
import CountryModal from "../countryModal/CountryModal";
import { fetchData, setSVG, createZoom, resizeListener, createCountryPaths, createColorScale, fetchCountryData, createSVGAndG, createRect } from '../../helpers/helpers';

function WorldMap() {
    // Deze state variabelen zijn bedoeld voor het tonen/verbergen van de modal en het laden van landgegevens
    const [show, setShow] = useState(false);
    const [countryData, setCountryData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Deze functies worden gebruikt om de modal te tonen/verbergen
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    // Deze ref wordt gebruikt om een referentie naar het SVG-element in de DOM te behouden
    const ref = useRef();

    useEffect(() => {
        const processMapData = async () => {
            // We laden de geografische gegevens van de landen
            const data = await fetchData(process.env.PUBLIC_URL + '/countries-50m.json');

            // Hier definiëren we de kleuren die voor de landen worden gebruikt. Verander de kleuren hier.
            const colors = ["#4C5F6B", "#2B3D41"];
            const colorScale = createColorScale(colors);

            // We maken de feature voor de landen
            const countries = feature(data, data.objects.countries);

            // Hier maken we het SVG-element en de g-groep (algemene container voor andere SVG-elementen)
            const { svg, g } = createSVGAndG(ref);

            // We berekenen de breedte en hoogte op basis van de grootte van het SVG-element
            const width = svg.node().getBoundingClientRect().width;
            const height = width * 0.6;

            // We stellen de geografische projectie in
            const projection = d3.geoMercator().fitSize([width, height], countries);

            // We maken en stellen een rechthoekig element in dat de grootte van de kaart definieert
            createRect(g, width, height, 'white');

            // We maken en stijlen de paden (landen) op de kaart
            g.selectAll('path')
                .call(createCountryPaths(countries, colorScale, fetchCountryData(setCountryData, setIsLoading, handleShow), projection));

            // We voegen zoom-functionaliteit toe aan de kaart
            createZoom(svg, g, width, height);

            // We voegen een event listener toe voor het aanpassen van de grootte van de kaart wanneer de grootte van het venster verandert
            resizeListener(svg, g, projection, countries, d3.geoPath(projection));
        };

        // We roepen de functie aan om de kaart te maken
        processMapData();
    }, []);

    return (
        <>
            {/* We renderen het SVG-element en de modal */}
            <svg ref={ref} style={{ width: '100%', height: 'auto' }} />
            <CountryModal show={show} handleClose={handleClose} countryData={countryData} isLoading={isLoading} />
        </>
    );
}

export default WorldMap;
