/* eslint-disable no-param-reassign */
const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  //   const value = err.message.match(/(["'])(?:(?=(\\?))\2.)*?\1/);
  //   console.log(value);
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another Value!`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid data input. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again.', 401);

const handleExpiredToken = () =>
  new AppError('Token Expired. Please Login again.', 401);

const sendErrorDev = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  } else {
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
};

// const sendErrorProd = (err, req, res) => {
//   if (err.isOperational) {
//     // Operational or trusted error: send message to client
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     // programming or non-operational error: don't leak error details

//     // 1)log the error
//     //  console.error('Error 💥', err);

//     // 2)send response to the client
//     res.status(500).json({
//       status: 'error',
//       message: 'Something went wrong!',
//     });
//   }
// };

const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // B) Programming or other unknown error: don't leak error details
    // 1) log error
    console.log('ERROR 💥', err);
    // 2) Send generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong!',
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    console.log(err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }

  // B) Programming or other unknown error: don't leak error details
  // 1) Log error
  console.log('ERROR 💥', err);
  // 2) Send generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
};

module.exports = (err, req, res, next) => {
  //   console.log(err.stack);
  err.statusCode = err.statusCode || 500; // internal server error
  err.status = err.status || 'error';

  console.log(err);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  }
  if (process.env.NODE_ENV === 'production') {
    console.log(err);
    let error = { ...err };
    error.message = err.message;
    // console.log('error is 💥: ', error);
    if (err instanceof mongoose.CastError) error = handleCastErrorDB(error);
    // if (error.name === 'castError')
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err instanceof mongoose.Error.ValidationError)
      error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleExpiredToken();
    sendErrorProd(error, req, res);
  }
};
