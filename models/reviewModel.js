const mongoose = require('mongoose');
const Tour = require('./tourModel');
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be less thern 5.0'],
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour.'],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to a user.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
reviewSchema.pre(/^find/, function (next) {
  /* this.populate({
    path: 'tour',
    select: 'name',
  }).populate({
    path: 'user',
    select: 'name photo',
  }); */
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});
reviewSchema.statics.calcAvgRating = async function (tourId) {
  //this points to the model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0].avgRating,
    ratingsQuantity: stats[0].nRating,
  });
};
//pre the current review does not exist so we need to use post
reviewSchema.post('save', function () {
  //this points to document use this.constructor
  this.constructor.calcAvgRating(this.tour);
});

//use query middelwar to update and delete

reviewSchema.pre(/^findOneAnd/, async function (next) {
  //retrive the current document and passe it to post meddelwar with this key
  //this points to the current query
  this.doc = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.doc.constructor.calcAvgRating(this.doc.tour);
});

//VIRTUAL POPULATE IS TO SHOW CHILDREN In PArent document Tour/review without keeping review array in Tour go to tour model
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
