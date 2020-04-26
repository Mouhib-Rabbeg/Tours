const express = require('express');
const viewController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const bookingController = require('./../controllers/bookingController');
const router = express.Router();

router.get(
  '/',
  bookingController.createbookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.login);
router.get('/signup', authController.isLoggedIn, viewController.signUp);
router.get('/me', authController.protect, viewController.showMe);
router.get('/my-tours', authController.protect, viewController.getMyTours);
router.get('/restPassword/:token', viewController.resetPassword);
router.get('/frogotPassword', viewController.forgotPassword);
module.exports = router;
