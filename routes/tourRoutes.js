const express = require('express');

const {
  getAllTours,
  addTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTopCheapTours,
  // checkID,
  // checkBody,
} = require('../controllers/tourControllers');

const tourRouter = express.Router();

// usage of the middleware
// tourRouter.param('id', checkID);

tourRouter.route('/top-5-tour').get(aliasTopTopCheapTours, getAllTours);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

tourRouter.route('/').get(getAllTours).post(addTour);

module.exports = tourRouter;
