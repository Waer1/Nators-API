const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

// USER ROUTE HANDLERS
exports.getAllUsers = getAll(User);

const filerObj = (obj, ...allowedFields) => {
  const filterdObj = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filterdObj[key] = obj[key];
  });

  return filterdObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.passwordConfim || req.body.password) {
    return next(
      new AppError(
        'this is not valid route to update the password please use updatePassword',
        400
      )
    );
  }

  const filterdObj = filerObj(req.body, 'name', 'email');
  console.log(filterdObj);
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filterdObj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    date: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.addUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined',
  });
};

exports.getMe = catchAsync(async (req, res, next) => {
  req.params.id = req.user.id;
  next();
});

exports.deleteUser = deleteOne(User);
exports.updateUser = updateOne(User);
exports.getUser = getOne(User);
