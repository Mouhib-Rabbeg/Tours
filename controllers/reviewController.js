const Review = require('./../models/reviewModel');
const handler = require('./handlerFactory');

exports.getAllReviews = handler.getAll(Review);
exports.getReview = handler.getOne(Review);
exports.createReview = handler.createOne(Review);
exports.deleteReview = handler.deleteOne(Review);
exports.updateReview = handler.updateOne(Review);

//Create MIDDELWEAR FUN TO PRE FILL req.body
exports.setTourUserId = (req, res, next) => {
  //CHECK IF TOUR ID IS IN req.body else grab it from the url same for user
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
