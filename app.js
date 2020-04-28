const express = require('express');
const morgan = require('morgan');
const ratelimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookie = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');
const reviewRouter = require('./routes/reviewRoutes');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRouter');
const bookingRoutes = require('./routes/bookingRoutes');
const bookingController = require('./controllers/bookingController');
//Start express app
const app = express();
//Trust proxy for heroku
app.enable('trust proxy');
app.set('view engine', 'pug');
app.set('views', './views');
app.use(express.static('./public'));

//MIDDELWEAR SECURITY

//Implement cors allow everyone to consume api
app.use(cors());
/*
app.use(cors({
  allow this specific url to consume api
  origin:"url"
}));

*/
//this to allow non simple request such as delete put patch to be consumed
app.options('*', cors());

app.use(helmet());
const limiter = ratelimit({
  max: 100,
  //allow 100 request for the same ip in 1 hr
  windowMs: 60 * 60 * 1000,
  message: 'too manu requests from this ip , try again in an hour !',
});
//APLLY THIS LIMITER TO /API ROUTE
app.use('/api', limiter);

//MIDDELWEAR TO SET ENV MODE
if (process.env.NODE_ENV === 'dev') {
  app.use(morgan('dev'));
}
//DATA COMMING needs to be not in JSON
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookingController.webhookCheckout
);

//GIVE ACCESS TO REQUIEST BODY
//LIMIT BODY SIZE
app.use(express.json({ limit: '10kb' }));
//Parse the cookie
app.use(cookie());
//DATA SANITIZATION AGAINST NoSQL INJECTION
app.use(mongoSanitize());
//DATA SANITIZATION AGAINST XSS ATTACKS
app.use(xss());
//PREVENT PARAMETRE POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
app.use(compression());
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//ROUTES

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRoutes);

module.exports = app;
