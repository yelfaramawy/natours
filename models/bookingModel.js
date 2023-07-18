const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A booking must belong to a user'],
  },
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'A booking must belong to a tour'],
  },
  price: {
    type: Number,
    required: [true, 'A booking must have a price.'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: {
    type: Boolean,
    default: true,
  },
});

bookingSchema.pre(/^find/, function (next) {
  this.populate('user').populate({
    path: 'user',
    select: 'name',
  });
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
