const Tour = require('../models/tourModel');
const User = require('../models/userModel');
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
      /* success_url: `${req.protocol}://${req.get('host')}/?tour=${
        tour.id
      }&user=${req.user.id}&price=${tour.price}` */
      success_url: `${req.protocol}://${req.get('host')}/my-tours`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      //description for the item tp buy
      line_items: [
        {
          name: `${tour.name} Tour`,
          description: tour.summary,
          images: [
            `${req.protocol}://${req.get('host')}/img/tours/${tour.imageCover}`,
          ],
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
const createbookingCheckout = async (session) => {
  const tour = session.client_reference_id;
  const user = User.findOne({ email: session.customer_email }).id;
  const price = session.display_items[0].amount / 100;
  await Booking.create({ tour, user, price });
};
exports.webhookCheckout = (req, res, next) => {
  const signatrue = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signatrue,
      process.env.STRIP_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`webhook error : ${err}`);
  }
  if (event.type === 'checkout.session.completed') {
    createbookingCheckout(event.data.object);
    res.status(200).json({
      recived: true,
    });
  }
};

/* exports.createbookingCheckout = async (req, res, next) => {
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
}; */

exports.createBooking = handler.createOne(Booking);
exports.getAllBookings = handler.getAll(Booking);
exports.getBooking = handler.getOne(Booking);
exports.updateBooking = handler.updateOne(Booking);
exports.deleteBooking = handler.deleteOne(Booking);
