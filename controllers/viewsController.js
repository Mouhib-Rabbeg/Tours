const Tour = require('./../models/tourModel');
const booking = require('./../models/bookingmodel');
exports.getOverview = async (req, res) => {
  try {
    // Get all tour data from collection
    const tours = await Tour.find();
    // build template
    //render the template
    res.status(200).render('overview', {
      title: 'All tours',
      tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    //get tour by slug
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });
    if (!tour) {
      throw 'there is no tour with this name';
    }
    res.status(200).render('tour', {
      tour,
      title: tour.name,
    });
  } catch (err) {
    res.status(404).render('error', {
      err,
    });
  }
};

exports.showMe = (req, res) => {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
exports.login = (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.signUp = (req, res) => {
  res.status(200).render('signup', {
    title: 'Signup',
  });
};
exports.resetPassword = (req, res) => {
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
  });
};

exports.forgotPassword = (req, res) => {
  res.status(200).render('forgotPassword', {
    title: 'forgot your password ?',
  });
};

exports.getMyTours = async (req, res) => {
  try {
    // 1 ) all bookings
    const bookings = await booking.find({ user: req.user.id });
    // 2) find tours with the returned IDs
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'my bookings',
      tours,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};
