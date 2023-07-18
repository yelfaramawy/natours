const Review = require('../models/reviewModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getUserandTourId = (req, res, next) => {
  // Applying nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
