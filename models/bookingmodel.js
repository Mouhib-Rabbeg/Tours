const mongoose = require('mongoose');

//Using parent refrencing
const bookingSchema = mongoose.Schema({
  tour: {
    type: mongoose.Schema.ObjectId,
    ref: 'Tour',
    required: [true, 'Tour must belong to a Tour'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Tour must belong to a User'],
  },
  price: {
    type: Number,
    required: [true, 'booking must have a price'],
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

bookingSchema.pre('/^find/', function (next) {
  this.populate('user').populate('tour', {
    path: 'tour',
    select: 'name',
  });
  next();
});

const booking = mongoose.model('Booking', bookingSchema);
module.exports = booking;
