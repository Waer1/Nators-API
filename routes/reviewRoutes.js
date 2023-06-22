const express = require('express');

const reviewRoutes = express.Router({ mergeParams: true });

const { protect, restrictTo } = require('../controllers/authController');
const {
  setTourUserId,
  getAllReviews,
  addReview,
  deleteReview,
  updateReview,
  getReview,
} = require('../controllers/reviewController');

reviewRoutes.use(protect);

reviewRoutes
  .route('/')
  .get(getAllReviews)
  .post(restrictTo('user'), setTourUserId, addReview);

reviewRoutes
  .route('/:id')
  .get(getReview)
  .delete(restrictTo('user', 'admin'), deleteReview)
  .patch(restrictTo('user', 'admin'), setTourUserId, updateReview);
module.exports = reviewRoutes;
