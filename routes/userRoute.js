const express = require('express');

const {
  getAllUsers,
  addUser,
  getUser,
  updateUser,
  deleteUser,
} = require('../controllers/userControllers');

const userRouter = express.Router();

userRouter.route('/').get(getAllUsers).post(addUser);

userRouter.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = userRouter;
