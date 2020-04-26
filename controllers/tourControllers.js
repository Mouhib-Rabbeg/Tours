const fs = require('fs');
const Tour = require('../models/tourModel');
const handler = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
/*const tours = JSON.parse(
  fs.readFileSync(`./dev-data/data/tours-simple.json`, 'utf-8')
);*/

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('plase uploade a image'), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);

exports.resizeTourImage = async (req, res, next) => {
  //check if imageCover && image are both uploaded
  //console.log(req.files);
  if (!req.files.imageCover || !req.files.imageCover) {
    return next();
  }
  //imagecover tour update takes req.body as parameter
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  //images
  req.body.images = [];
  //loop req.files
  //map return an array of promisses cuz of sharp need to u promies.all to await all the promises
  await Promise.all(
    req.files.images.map(async (elt, index) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

      await sharp(elt.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ qualty: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );

  next();
};

exports.aliasTopTour = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'ratingsAverage,price';
  req.query.fields = 'name,price,summray,ratingsAverage';
  next();
};

exports.getAllTours = handler.getAll(Tour);
exports.getTour = handler.getOne(Tour, { path: 'reviews' });
exports.createTour = handler.createOne(Tour);
exports.updateTour = handler.updateOne(Tour);
exports.deleteTour = handler.deleteOne(Tour);

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: {
          ratingsAverage: { $gte: 4.5 },
        },
      },
      {
        $group: {
          _id: '$difficulty',
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgrating: { $avg: '$ratingsAverage' },
          avgprice: { $avg: '$price' },
          minpice: { $min: '$price' },
          maxpice: { $max: '$price' },
        },
      },
    ]);
    res.status(201).json({
      status: 'success',
      data: {
        stats: stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        //deconstruct an arry filed from document and output 1 document per elt in the array
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          countTour: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          //remove the field
          _id: 0,
        },
      },
      {
        $sort: { countTour: -1 },
      },

      //$limit:12
    ]);

    res.status(201).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/*
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing proprite'
    });
  }
  next();
};*/
