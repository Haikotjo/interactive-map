import * as d3 from 'd3';

// Deze functie haalt data op van een gegeven URL
export const fetchData = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
}

// Deze functie stelt een SVG element in met een bepaalde breedte en hoogte, gebaseerd op de breedte van het parent element.
export const setSVG = (ref) => {
    const svg = d3.select(ref.current);
    const width = svg.node().getBoundingClientRect().width;
    const height = width * 0.6;
    svg.attr('viewBox', `0 0 ${width} ${height}`);
    return svg;
}

// Deze functie voegt zoom-functionaliteit toe aan de kaart
export const createZoom = (svg, g) => {
    const width = svg.node().getBoundingClientRect().width;
    const height = width * 0.6;
    const zoom = d3.zoom()
        .scaleExtent([1, 30]) // Hier kun je de zoomlimieten aanpassen
        .on('zoom', (event) => {
            let {x, y, k} = event.transform;
            x = Math.min((width / height) * (k - 1), Math.max(width * (1 - k), x));
            y = Math.min(0, Math.max(height * (1 - k), y));
            g.attr('transform', `translate(${x},${y}) scale(${k})`);
        });

    svg.call(zoom);
}

// Deze functie voegt een event listener toe voor het aanpassen van de grootte van de kaart wanneer de grootte van het venster verandert
export const resizeListener = (svg, rect, projection, countries, path, g) => {
    window.addEventListener('resize', () => {
        const newWidth = svg.node().getBoundingClientRect().width;
        const newHeight = newWidth * 0.6;
        rect.attr('width', newWidth).attr('height', newHeight);
        projection.fitSize([newWidth, newHeight], countries);
        g.selectAll('path').attr('d', path);
    });
}

// Deze functie maakt en stijlt de paden (landen) op de kaart
export const createCountryPaths = (countries, colorScale, fetchCountryData, projection) => {
    return (selection) => {
        const path = d3.geoPath(projection);
        selection
            .data(countries.features)
            .join('path')
            .attr('d', path)
            .attr('fill', d => colorScale(d.properties.name)) // De vulling van de landen kan hier worden aangepast
            .attr('stroke', '#00FFC5') // De lijnkleur van de landen kan hier worden aangepast
            .attr('stroke-width', 0.5) // De lijndikte van de landen kan hier worden aangepast
            .on('click', async function(event, d) {
                fetchCountryData(d.properties.name);
            })
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('fill', d => d3.rgb(colorScale(d.properties.name)).brighter(0.5)) // De vulling van de landen bij mouseover kan hier worden aangepast
                    .attr('stroke', d => colorScale(d.properties.name)); // De lijnkleur van de landen bij mouseover kan hier worden aangepast
            })
            .on('mouseout', function(event, d) {
                d3.select(this)
                    .attr('fill', d => colorScale(d.properties.name)) // De vulling van de landen bij mouseout kan hier worden aangepast
                    .attr('stroke', '#333'); // De lijnkleur van de landen bij mouseout kan hier worden aangepast
            });
    };
};

// Deze functie maakt een kleurschaal met de opgegeven kleuren
export const createColorScale = (colors) => {
    return d3.scaleOrdinal(colors);
};

// Deze functie haalt gegevens op voor een bepaald land en zet de modal status op "show"
export const fetchCountryData = (setCountryData, setIsLoading, handleShow) => async (countryName) => {
    setIsLoading(true);
    try {
        const data = await fetchData(`https://restcountries.com/v3.1/name/${countryName}`);
        setCountryData(data[0]);
        setIsLoading(false);
        handleShow();
    } catch (error) {
        console.error('Fout bij het laden van de landgegevens:', error);
        setIsLoading(false);
    }
};

// Deze functie maakt een SVG en een g-groep (algemene container voor andere SVG-elementen)
export const createSVGAndG = (ref) => {
    const svg = setSVG(ref);
    const g = svg.append('g');
    return { svg, g };
};

// Deze functie maakt een rechthoek met de opgegeven breedte, hoogte en vulkleur
export const createRect = (g, width, height, fillColor) => {
    return g.append('rect')
        .attr('width', width)
        .attr('height', height)
        .style('fill', fillColor); // De vulling van de rechthoek kan hier worden aangepast
};

// Deze functie voegt zoom-functionaliteit toe aan de globe
export const createGlobeZoom = (svg, projection, path, g) => {
    const zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on('zoom', (event) => {
            const { transform } = event;
            g.attr('transform', transform);
            g.attr('stroke-width', 0.5 / transform.k); // Pas ook de lijndikte aan op basis van de zoomschaal
        });

    svg.call(zoom);
};


// Deze functie voegt slepen-functionaliteit toe aan de globe
export const createGlobeDrag = (projection, path, g) => {
    const drag = d3.drag()
        .on('drag', function (event) {
            const rotate = projection.rotate();
            projection.rotate([rotate[0] + event.dx / 4, rotate[1] - event.dy / 4]);
            g.selectAll('path').attr('d', path);
        });

    g.call(drag);
}
