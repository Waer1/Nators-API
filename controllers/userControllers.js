const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const filerObj = (obj, ...allowedFields) => {
  const filterdObj = {};

  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) filterdObj[key] = obj[key];
  });

  return filterdObj;
};

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

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

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = (req, res, next) => {
  if (!req.file) next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.${ext}`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
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

  if (req.file) filterdObj.photo = req.file.filename;

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
exports.getAllUsers = getAll(User);
