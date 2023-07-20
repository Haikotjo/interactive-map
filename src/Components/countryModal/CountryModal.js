import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './CountryModal.css'; // Importeer je aangepaste CSS

function CountryModal({ show, handleClose, countryData }) {
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{countryData ? countryData.name.common : "Loading..."}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Conditioneel renderen van de rest van je modal inhoud */}
                {countryData ? (
                    <>
                        <p>Hoofdstad: {countryData.capital ? countryData.capital[0] : 'Niet beschikbaar'}</p>
                        <p>Regio: {countryData.region ? countryData.region : 'Niet beschikbaar'}</p>
                        <p>Bevolking: {countryData.population ? countryData.population : 'Niet beschikbaar'}</p>
                        {/* etc. */}
                    </>
                ) : (
                    <p>Loading data...</p>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CountryModal;
