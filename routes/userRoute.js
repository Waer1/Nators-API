const express = require('express');

const {
  getAllUsers,
  addUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  getMe,
} = require('../controllers/userControllers');

const {
  createUser,
  signIn,
  forgetPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
} = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(createUser);
userRouter.route('/signin').post(signIn);
userRouter.route('/forgetPassword').post(forgetPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);

userRouter.use(protect);

userRouter.route('/updatePassword').patch(updatePassword);
userRouter.route('/updateMe').patch(updateMe);
userRouter.route('/deleteMe').delete(deleteMe);
userRouter.route('/me').get(getMe, getUser);

userRouter.use(restrictTo('admin'));

userRouter.route('/').get(getAllUsers).post(addUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(protect, restrictTo('admin'), updateUser)
  .delete(deleteUser);

module.exports = userRouter;
