const APIFeature = require('./../utilits/APIFeature');

exports.deleteOne = (model) => async (req, res) => {
  try {
    const doc = await model.findByIdAndDelete(req.params.id);
    if (!doc) {
      throw 'no document found with this id';
    }

    res.status(204).json({
      status: 'success',
      message: 'doc deleted !',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
/* exports.deleteTour = async (req, res) => {
    try {
      await Tour.findByIdAndDelete(req.params.id);
      res.status(204).json({
        status: 'success',
        message: 'doc deleted !',
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  }; */

exports.updateOne = (model) => async (req, res) => {
  try {
    const updatedDoc = await model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //to run the validator again
      runValidators: true,
    });
    if (!updatedDoc) throw 'document not found';
    res.status(201).json({
      status: 'success',
      data: {
        updatedDoc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
  //code200
};
/* exports.updateTour = async (req, res) => {
  try {
    const updatedtour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      //to run the validator again
      runValidators: true,
    });
    res.status(201).json({
      status: 'success',
      data: {
        tour: updatedtour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
  //code200
}; */

exports.createOne = (model) => async (req, res) => {
  try {
    const newDoc = await model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newDoc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
/* exports.createTour = async (req, res) => {
    try {
      const newTour = await Tour.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  }; */
exports.getOne = (model, populateOptions) => async (req, res) => {
  try {
    let query = model.findById(req.params.id);
    //Populate to embbed data in output
    if (populateOptions) query.populate(populateOptions);
    const doc = await query;

    if (!doc) throw 'no document found';

    res.status(200).json({
      status: 'success',
      requistedAt: req.requestTime,
      data: {
        doc,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

/* async (req, res) => {
    try {
      //Populate to embbed data in output
      const tours = await await Tour.findById(req.params.id).populate({
        path: 'reviews',
        select: '-__v',
      });
      //Tour.find({_id:req.params.id})
  
      res.status(200).json({
        status: 'success',
        requistedAt: req.requestTime,
        data: {
          tours: tours,
        },
      });
    } catch (err) {
      res.status(400).json({
        status: 'fail',
        message: err,
      });
    }
  }; */

exports.getAll = (model) => async (req, res) => {
  try {
    //allow nested get reviews
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };
    //BUILDING THE QUERY
    const f = new APIFeature(model.find(filter), req.query)
      .filter()
      .sort()
      .limitFiled()
      .pagination();

    /* const docs = await f.query.explain(); */
    const docs = await f.query;
    /*const tourd = await Tour.find()
        .where('duration')
        .equals(5);*/
    res.status(200).json({
      status: 'success',
      requistedAt: req.requestTime,
      resulats: docs.length,
      data: {
        docs,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
