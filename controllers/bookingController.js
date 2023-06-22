const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const Tour = require('../models/tourModel');
const { getAll, getOne, createOne, deleteOne, updateOne } = require('./handlerFactory');
const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  const { tourId } = req.params;
  // get the selected tour
  const tour = await Tour.findById(tourId);

  if (!tour) {
    next(new Error('No tour found with id ' + tourId));
  }
  // create the checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    sucess_url: `${req.protocol}://${req.get('host')}/?tour=${tourId}&user=${
      req.user.id
    }&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: tourId,
    line_items: [
      {
        name: `${tour.name} Tour`,
        description: tour.summary,
        images: [`https://www.natours.dev/img/tours/${tour.imageCover}`],
        amount: tour.price * 100,
        currency: 'usd',
        quantity: 1,
      },
    ],
  });

  res.status(200).json({
    status: 'success',
    session: session,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  if (!tour || !user || !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.getAllBookings = getAll(Booking);
exports.createBooking = createOne(Booking);
exports.getBooking = getOne(Booking);
exports.deleteBooking = deleteOne(Booking);
exports.updateBooking = updateOne(Booking);
