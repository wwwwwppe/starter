const express = require('express');
const tourController = require('./../controllers/tourController');
//const { id } = require('../controllers/tourController');
const { getAllTours, createTour, getTour, updateTour, deleteTour, aliasTopTours } = tourController;
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourController.checkID);

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);


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
    .route('/monthly-plan/:year')
    .get(tourController.getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, getAllTours) //中间件按照先后顺序来运行的
    .post(createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        deleteTour
    );

module.exports = router;