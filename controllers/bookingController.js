const Tour = require('../models/tourModel');
const Booking = require('../models/bookingmodel');
const stripe = require('stripe')(process.env.STRIP_SECRET_KEY);
const handler = require('../controllers/handlerFactory');
exports.getCheckoutSession = async (req, res, next) => {
  try {
    //1)get the current booked tour
    const tour = await Tour.findById(req.params.tourId);
    //2) create checkout session
    const session = await stripe.checkout.sessions.create({
      // 3 require
      /*
      ?
      */

      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/?tour=${
        tour.id
      }&user=${req.user.id}&price=${tour.price}`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      //description for the item tp buy
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [tour.imagesCover],
          amount: tour.price * 100,
          currency: 'usd',
          quantity: 1,
        },
      ],
    });
    //3)create session as response
    res.status(200).json({
      status: 'success',
      session,
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.createbookingCheckout = async (req, res, next) => {
  //this unsecure coz url is exposed
  try {
    const { tour, user, price } = req.query;
    if (!tour && !user && !price) return next();

    // next should be called on views route  because of the success url

    await Booking.create({ tour, user, price });

    //create new requiest
    res.redirect(`${req.protocol}://${req.get('host')}/`);
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};
//4242 4242 4242 4242

exports.createBooking = handler.createOne(Booking);
exports.getAllBookings = handler.getAll(Booking);
exports.getBooking = handler.getOne(Booking);
exports.updateBooking = handler.updateOne(Booking);
exports.deleteBooking = handler.deleteOne(Booking);
