const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      /*
      //third part validator
      validate: {
        validator: validator.isAlpha,
        message: 'name must contains only caracteres'
      }
       
      validate:[validator.isAlpha,'message']
      */
    },

    slug: String,
    duration: {
      type: Number,
      required: [true, 'must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true],
    },
    difficulty: {
      type: String,
      required: [true, 'must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: `difficulty must be ['easy', 'medium','difficult'] `,
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be less thern 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          //only for creating new doc not for update
          return val < this.price;
        },
        message: 'price Discount must be less then the price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'a tour must have description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    //make calculated field show up in the output
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

//combined index works for the individual field
tourSchema.index({
  price: 1,
  ratingsAverage: -1,
});
tourSchema.index({
  slug: 1,
});

//DOCUMENT MIDLWEAR:runs before the .save and .create
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/*
tourSchema.post('save', function(doc, next) {
  //console.log(doc);
  next();
});
*/

//THIS HOW WE EMBBED DATA
//tourSchema.pre('save', async function (next) {
//this will return an array of promises
//  const arrayPromises = this.guides.map(async (id) => await User.findById(id));
// this.guides = await Promise.all(arrayPromises);
//});

/*
//QUERY MIDELWEAR // tom ake the workd for all find use regular expression /^find/
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
*/

//Populate to make embbeded data shows up in the output
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v',
  });
  next();
});
//same for aggregation
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
/*Mongoose  midlwear is fire an event 
or function when ever a operation in the data base occure !*/
