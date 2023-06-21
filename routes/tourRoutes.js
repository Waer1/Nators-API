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

const reviewRouter = require('../routes/reviewRoutes');

tourRouter.use('/:tourId/reviews', reviewRouter);

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/monthly-stats/:year').get(getMonthlyStats);

tourRouter
  .route('/top-5-tour')
  .get(
    protect,
    restrictTo('admin', 'lead-guide', 'guide'),
    aliasTopTopCheapTours,
    getAllTours
  );

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

tourRouter
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), addTour);

module.exports = tourRouter;
