const Tours = require('../models/tourModel');
const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, getOne, getAll, updateOne } = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

exports.getTourWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const Radius = unit == -'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng)
    return next(
      new AppError(
        'Please provide latitude and longitude in the format lat,lng',
        400
      )
    );

  const tours = await Tours.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], Radius] } },
  });

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});

exports.aliasTopTopCheapTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = getAll(Tours);

exports.getTour = getOne(Tours, [{ path: 'reviews' }]);

exports.addTour = catchAsync(async (req, res, next) => {
  const newTour = await Tours.create(req.body);

  if (!newTour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour,
    },
  });
});

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), true);
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

exports.resizeTourimages = catchAsync(async (req, res, next) => {
  console.log(req.files);

  if (!req.files.imageCover || !req.files.images) next();

  // cover image
  const ext = req.files.imageCover[0].mimetype.split('/')[1];
  const imageCoverFilename = `user-${req.params.id}-${Date.now()}-cover.${ext}`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${imageCoverFilename}`);
  req.body.imageCover = imageCoverFilename;

  // images
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const ext = file.mimetype.split('/')[1];
      const imageFilename = `user-${req.params.id}-${Date.now()}-${
        i + 1
      }.${ext}`;
      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${imageFilename}`);
      req.body.images.push(imageFilename);
    })
  );

  next();
});

exports.updateTour = updateOne(Tours);

exports.deleteTour = deleteOne(Tours);

exports.getTourStats = catchAsync(async (req, res, next) => {
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
});

exports.getMonthlyStats = catchAsync(async (req, res, next) => {
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
});
