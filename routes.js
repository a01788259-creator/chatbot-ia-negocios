// routes.js

const express = require('express');
const router = express.Router();

// Appointment Handling
router.post('/appointments', (req, res) => {
    // Logic for handling appointment requests
    res.send('Appointment created!');
});

router.get('/appointments/:id', (req, res) => {
    // Logic for retrieving appointment details
    res.send('Appointment details for id: ' + req.params.id);
});

// Menu Requests
router.get('/menu', (req, res) => {
    // Logic for returning menu
    res.send('Menu items here!');
});

// Promotions
router.get('/promotions', (req, res) => {
    // Logic for returning promotions
    res.send('Current promotions!');
});

module.exports = router;