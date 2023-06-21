const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.deleteOne = (model) =>
  catchAsync(async (req, res, next) => {
    const deletedDocument = await model.findByIdAndDelete(req.params.id);

    if (!deletedDocument) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (model) =>
  catchAsync(async (req, res, next) => {
    const updatedDocument = await model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedDocument) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        updatedData: updatedDocument,
      },
    });
  });

exports.createOne = (model) =>
  catchAsync(async (req, res, next) => {
    const newDocument = await model.create(req.body);

    if (!newTour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: {
        Document: newDocument,
      },
    });
  });

exports.getOne = (model, populatingOptions = []) =>
  catchAsync(async (req, res, next) => {
    let query = model.findById(req.params.id);
    populatingOptions.map((option) => {
      query = query.populate(option);
    });
    const doc = await query;

    if (!doc) {
      return next(new AppError('No Document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        document: doc,
      },
    });
  });

exports.getAll = (model, populatingOptions = []) =>
  catchAsync(async (req, res) => {
    const filter = {};

    if (req.params.tourId) filter['tour'] = req.params.tourId;

    let query = model.find(filter);
    populatingOptions.map((option) => {
      query = query.populate(option);
    });

    // Builing Query
    query = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limit()
      .fields()
      .paginate();

    const doc = await query.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
