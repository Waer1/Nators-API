const fs = require('fs');

const express = require('express');

const morgan = require('morgan');

const AppError = require('./utils/appError');

const { globalErrorHandler } = require('./controllers/errorController');

const userRouter = require(`./routes/userRoute`);

const tourRouter = require(`./routes/tourRoutes`);

const app = express();

// MIDDLEWARES
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

// ROUTES

app.use('/api/v1/tours', tourRouter);

app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`cant find ${req.originalUrl} on this server!!!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
