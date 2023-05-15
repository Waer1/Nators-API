const express = require('express');

const {
  getAllTours,
  addTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
} = require('../controllers/tourControllers');

const tourRouter = express.Router();

tourRouter.param('id', checkID);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

tourRouter.route('/').get(getAllTours).post(checkBody, addTour);

module.exports = tourRouter;
