const express = require('express');
const tourController = require('../controllers/tourControllers');
const auth = require('../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');
const router = express.Router();

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTour, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);
router
  .route('/monthly-plan/:year')
  .get(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  //.post(tourController.checkBody, tourController.createTour);
  .post(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImage,
    tourController.updateTour
  )
  .delete(
    auth.protect,
    auth.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

//POST /tour/id/reviews
//GEt /tour/id/reviews/
//GET /tour/id/reviews/id

/* router
  .route('/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  ); */

//this tells tour router to use review router in case it counters this url :)
router.use('/:tourId/reviews', reviewRouter);

module.exports = router;
