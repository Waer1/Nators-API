const Review = require('../models/reviewModel');
const {
  deleteOne,
  createOne,
  updateOne,
  getOne,
  getAll,
} = require('./handlerFactory');

exports.setTourUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;www
  req.body.user = req.user.id;
  next();
};

exports.getAllReviews = getAll(Review);
exports.addReview = createOne(Review);
exports.deleteReview = deleteOne(Review);
exports.updateReview = updateOne(Review);
exports.getReview = getOne(Review);
