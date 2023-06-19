const express = require('express');

const {
  getAllUsers,
  addUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userControllers');

const {
  createUser,
  signIn,
  forgetPassword,
  resetPassword,
} = require('../controllers/authController');

const userRouter = express.Router();

userRouter.route('/signup').post(createUser);
userRouter.route('/signin').post(signIn);
userRouter.route('/forgetPassword').post(forgetPassword);
userRouter.route('/resetPassword/:token').patch(resetPassword);

userRouter.route('/').get(getAllUsers).post(addUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
