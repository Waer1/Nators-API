const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const AppError = require('./utils/appError');
const { globalErrorHandler } = require('./controllers/errorController');
const userRouter = require(`./routes/userRoute`);
const tourRouter = require(`./routes/tourRoutes`);
const reviewRouter = require(`./routes/reviewRoutes`);
const app = express();

// MIDDLEWARES
app.use(helmet({}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

const rateLimiter = rateLimit({
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: 'Rate limit exceeded for one IP',
});
app.use('/api', rateLimiter);

app.use(
  express.json({
    limit: '10kb',
  })
);

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['duration', 'ratingQuantity', 'price', 'ratingAvarage'],
  })
);

app.use(express.static(`${__dirname}/public`));

// ROUTES

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server!!!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
