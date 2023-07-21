import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './CountryModal.css'; // Importeer je aangepaste CSS

function CountryModal({ show, handleClose, countryData }) {
    return (
        <Modal show={show} onHide={handleClose} className="custom-modal">
            <Modal.Header closeButton className="custom-modal-content">
                <Modal.Title className="custom-modal-title">
                    {countryData ? countryData.name.common : 'Loading...'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="custom-modal-body">
                {/* Conditioneel renderen van de rest van je modal inhoud */}
                {countryData ? (
                    <>
                        <p>Hoofdstad: {countryData.capital ? countryData.capital[0] : 'Niet beschikbaar'}</p>
                        <p>Regio: {countryData.region ? countryData.region : 'Niet beschikbaar'}</p>
                        <p>Bevolking: {countryData.population ? countryData.population : 'Niet beschikbaar'}</p>
                        {/* etc. */}
                        <h2>Nieuwsartikelen:</h2>
                        {countryData.newsArticles && countryData.newsArticles.length > 0 ? (
                            countryData.newsArticles.map((article, index) => (
                                <div key={index}>
                                    <h3>{article.title}</h3>
                                    <p>{article.description}</p>
                                    <a href={article.url}>Lees meer</a>
                                </div>
                            ))
                        ) : (
                            <p>Geen nieuwsartikelen beschikbaar.</p>
                        )}
                    </>
                ) : (
                    <p>Loading data...</p>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Body>
        </Modal>
    );
}

export default CountryModal;
