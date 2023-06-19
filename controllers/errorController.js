const AppError = require('../utils/appError');

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Log the error
    console.error('ERROR 💥', err);

    // Send a generic error message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong! 💥💥💥',
    });
  }
};

const handleCastErrorDB = (err, res, next) => {
  return new AppError(
    `Invalid data provided in the field ${err.path} with value ${err.value}.`,
    400
  );
};

const handleDBerrors = (err, res, next) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJsonWebTokenError = () => {
  return new AppError('the token is not valid', 401);
};
const handleTokenExpiredError = () => {
  return new AppError('the token is expried', 401);
};

exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 404;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(err, res);
    else if (err.name === 'ValidationError') error = handleDBerrors(err, res);
    else if (err.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError();
    else if (err.name === 'TokenExpiredError')
      error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
};
