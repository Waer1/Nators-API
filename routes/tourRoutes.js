const express = require('express');

const {
  getAllTours,
  addTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTopCheapTours,
  getTourStats,
  getMonthlyStats,
} = require('../controllers/tourControllers');

const tourRouter = express.Router();

const { protect, restrictTo } = require('../controllers/authController');

// usage of the middleware
// tourRouter.param('id', checkID);

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/monthly-stats/:year').get(getMonthlyStats);

tourRouter.route('/top-5-tour').get(aliasTopTopCheapTours, getAllTours);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

tourRouter.route('/').get(protect, getAllTours).post(addTour);

module.exports = tourRouter;
