import * as d3 from 'd3';
import axios from 'axios';

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

            // Bereken de zoomfactor als een percentage van de beginwaarde
            const zoomPercentage = (k / 1.4) * 100;

            // Toon de zoom factor in het HTML element
            const zoomFactorElement = document.getElementById('zoom-factor');
            zoomFactorElement.innerText = `Zoom: ${zoomPercentage.toFixed(2)}%`;
            zoomFactorElement.style.display = 'block';

            // Verberg het HTML element na een seconde
            setTimeout(() => {
                zoomFactorElement.style.display = 'none';
            }, 2000);
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
            .data(countries.features.filter(feature => feature.properties.name !== 'Antarctica')) // filter out Antarctica
            .join('path')
            .attr('d', path)
            .attr('fill', d => colorScale(d.properties.name)) // De vulling van de landen kan hier worden aangepast
            .attr('stroke', '#00FFC5') // De lijnkleur van de landen kan hier worden aangepast
            .attr('stroke-width', 0.5) // De lijndikte van de landen kan hier worden aangepast
            .on('click', async function(event, d) {
                fetchCountryData(d.properties.name);
            })
            .on('mouseover', function(event, d) {
                const element = d3.select(this);
                element
                    .attr('data-original-stroke', element.attr('stroke')) // Sla de oorspronkelijke stroke kleur op
                    .attr('data-original-fill', element.attr('fill')) // Sla de oorspronkelijke fill kleur op
                    .attr('fill', '#27190c') // Verander de vulling van de landen bij mouseover naar een specifieke kleur, in dit geval rood
                    .attr('stroke', '#ff0000'); // Verander de lijnkleur van de landen bij mouseover naar een specifieke kleur, in dit geval rood
            })
            .on('mouseout', function(event, d) {
                const element = d3.select(this);
                element
                    .attr('fill', d => colorScale(d.properties.name)) // De vulling van de landen bij mouseout kan hier worden aangepast
                    .attr('stroke', element.attr('data-original-stroke')); // Herstel de oorspronkelijke kleur
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
        // Haal landgegevens op van Rest Countries API
        const countryData = await fetchData(`https://restcountries.com/v3.1/name/${countryName}`);
        setCountryData(countryData[0]);
        console.log(countryData);

        // Haal de ISO 3166-1 alpha-2 code op van het countryData object
        const countryCode = countryData[0].cca2.toLowerCase(); // 2-letter ISO 3166-1 code van het land
        console.log(`Country Code for ${countryName}: ${countryCode}`);

        // Haal nieuwsartikelen op met de juiste landcode van de News API
        const newsArticles = await getHeadlines(countryCode);

        // Hier kun je de nieuwsartikelen opslaan in een aparte state-variabele in plaats van setCountryData te gebruiken, als je dat wilt.
        setCountryData((prevData) => ({
            ...prevData,
            newsArticles: newsArticles,
        }));
        console.log('Fetching country data for country:', countryName); // Log de waarde van countryName
        setIsLoading(false);
        handleShow();
    } catch (error) {
        console.error('Fout bij het laden van de landgegevens of nieuwsartikelen:', error);
        setIsLoading(false);
    }
};

export async function getHeadlines(country) {
    console.log(`Fetching headlines for country: ${country}`);

    try {
        const response = await axios.get('https://newsapi.org/v2/top-headlines', {
            params: {
                country: country,
                pageSize: 2,
                apiKey: process.env.REACT_APP_NEWS_API_KEY // Zorg ervoor dat dit de juiste naam van de omgevingsvariabele is
            }
        });
        console.log('API Request:', response.config.url); // Log het volledige verzoek URL
        console.log('API Params:', response.config.params); // Log de meegegeven parameters
        return response.data.articles;
    } catch (error) {
        console.error('Er ging iets mis bij het ophalen van de nieuwsartikelen:', error);
        return [];
    }
}



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

