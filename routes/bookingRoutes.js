const express = require('express');
const bookingRouter = express.Router();
const {
  getAllBookings,
  createBooking,
  getCheckoutSession,
  getBooking,
  updateBooking,
  deleteBooking,
} = require('../controllers/bookingController');
const { protect, restrictTo } = require('../controllers/authController');

bookingRouter.use(protect);

bookingRouter.get('/checkout-session/:tourId', getCheckoutSession);

bookingRouter.use(restrictTo('admin', 'lead-guide'));

bookingRouter.use(restrictTo('admin'));

bookingRouter.route('/').get(getAllBookings).post(createBooking);

bookingRouter
  .route('/:id')
  .get(getBooking)
  .patch(updateBooking)
  .delete(deleteBooking);

module.exports = bookingRouter;
