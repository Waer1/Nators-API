const fs = require('fs');

const express = require('express');

const morgan = require('morgan');

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

module.exports = app;