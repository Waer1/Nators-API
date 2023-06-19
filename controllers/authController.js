const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_IN,
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    role: req.body.role,
  });

  const token = signToken(newUser.id);

  res.status(201).json({
    status: 'success',
    token: token,
    date: {
      user: newUser,
    },
  });
});

exports.signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if the email and password are provided
  if (!email || !password) {
    return next(new AppError('Please provide email and password.', 400));
  }

  // chack if the password is correct and the user exist
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !user.correctPassword(password, user.password)) {
    return next(new AppError('the email or the password are incorrect', 401));
  }

  const token = signToken(user.id);
  res.status(200).json({
    status: 'success',
    token: token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check if the authorization header is exists and start with bearer token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // check if the token exist
  if (!token) {
    return next(
      new AppError(
        'you are not autorized to do this action please login in again',
        401
      )
    );
  }

  // verify the token is valid and not expired
  const decodedToken = verifyToken(token);

  const currentUser = await User.findById(decodedToken.id);

  if (!currentUser) {
    return next(
      new AppError('this token belong to non exist user plase login again', 401)
    );
  }

  // verify the token is not created before user change the password
  if (currentUser.changedPasswordAfter(decodedToken.iat)) {
    return next(
      new AppError(
        'its look like the user change password after creting this token',
        401
      )
    );
  }

  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you dont have the permission to do this action'),
        403
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const targetUser = await User.findOne({ email: email });
  // check if the user exists
  if (!targetUser) {
    return next(new AppError('there no user with that email', 404));
  }

  // generate the resest Token
  const resetToken = targetUser.generateRandomResetPassword();
  targetUser.save({ validateBeforeSave: false });

  // make the message and reset url ready
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/vi/resetPassword/${resetToken}`;
  const message = `forgot your password, submit a patch request to reset your password on ${resetUrl}, if you didint forget it just ignor this message`;

  // send the reset token to the user
  const options = {
    to: targetUser.email,
    subject: 'Your reset token will be expired in 10 mins',
    text: message,
  };

  // await sendEmail(options);

  res.status(200).json({
    status: 'success',
    message: 'resest token has been sent',
    token: resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hasedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const targetUser = await User.findOne({
    passwordResetToken: hasedToken,
    passwordResetTokenExpiration: { $gt: Date.now() },
  });

  if (!targetUser) {
    return next(new AppError('Invalid or expired token', 400));
  }

  targetUser.password = req.body.password;
  targetUser.passwordConfirm = req.body.passwordConfirm;
  targetUser.passwordResetToken = undefined;
  targetUser.passwordResetTokenExpiration = undefined;
  await targetUser.save();

  const token = await signToken(targetUser.id);

  res.status(200).json({
    status: 'success',
    token: token,
  });
});
