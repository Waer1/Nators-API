const Tours = require('../models/tourModel');

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
    // 1) filtering
    const queryobj = { ...req.query };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach((ex) => delete queryobj[ex]);

    // 2) Advanced filtering
    let queryStr = JSON.stringify(queryobj);
    const advancedQueryobj = JSON.parse(
      queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`)
    );

    let query = Tours.find(advancedQueryobj);

    // 3) Sort results
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('createdAt');
    }

    let limit = req.query.limit;
    // 4)LIMIT
    if (req.query.limit) {
      query = query.limit(limit);
    } else {
      limit = 5;
    }

    // 5) Fields
    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    } else {
      query = query.select('-__v -_id');
    }

    // 6)Paggination
    if (req.query.page) {
      const numberOfTours = await Tours.countDocuments({});
      if ((req.query.page - 1) * limit >= numberOfTours)
        throw new Error('Limit exceeded');
      query = query.skip((req.query.page - 1) * limit).limit(limit);
    }

    const tours = await query;
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
