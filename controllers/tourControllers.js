const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');

// middleware for
// exports.checkBody = (req, res, next) => {
//   if (!req.body.price || !req.body.name) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid tour price or name',
//     });
//   }
//   next();
// };

// used as middleware
// exports.checkID = (req, res, next, val) => {
//   if (!toursData[val]) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID',
//     });
//   }

//   next();
// };

exports.aliasTopTopCheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // Builing Query
    const query = new APIFeatures(Tours.find(), req.query)
      .filter()
      .sort()
      .limit()
      .fields()
      .paginate();

    const tours = await query.query;
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        toursData: tours,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const allTours = await Tours.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      results: allTours.length,
      data: {
        toursData: allTours,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.addTour = async (req, res) => {
  try {
    const newTour = await Tours.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tours.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      data: {
        tourData: updatedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const deetedTour = await Tours.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: {
        tourData: deetedTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'error',
      message: err,
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tours.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRating: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        tourData: stats,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};

exports.getMonthlyStats = async (req, res) => {
  try {
    const year = req.params.year;
    const monthlyStats = await Tours.aggregate([
      {
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
          numToursStats: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '_id' },
      },
      {
        $sort: { numToursStats: -1 },
      },
      {
        $limit: 6,
      },
      {
        $project: {
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        monthlyStats,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      status: 'error',
      message: error,
    });
  }
};
