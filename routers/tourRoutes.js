const express = require('express');
const tourController = require('./../controllers/tourController');
//const { id } = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour,aliasTopTours } = tourController;
const router = express.Router();

// router.param('id', tourController.checkID);

// Create a checkBody middleware
// Check if body contains the name and price property
// If not, send back 400 (bad request)
// Add it to hte post handler stack
router
    .route('/top-5-cheap')
    .get(aliasTopTours, getAllTours);

router
    .route('/tour-stats')
    .get(tourController.getTourStats);

router
    .route('/')
    .get(getAllTours)
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;