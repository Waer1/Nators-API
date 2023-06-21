const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

dotenv.config({
  path: './config.env',
});

var DB_URL = process.env.DATABASE_URL.replace(
  '<USER>',
  process.env.DATABASE_USER
);
DB_URL = DB_URL.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
DB_URL = DB_URL.replace('<HOST>', process.env.DATABASE_HOST);

mongoose
  .connect(DB_URL, {
    useNewUrlParser: true,
  })
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

const toursData = JSON.parse(
  fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
);
const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);
const reviewsData = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(toursData);
    console.log('data: successfully added to tour');
    await User.create(usersData, { validationBeforeSave: false });
    console.log('data: successfully added to User');
    await Review.create(reviewsData);
    console.log('data: successfully added to Reviews');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('data: successfully deleted to tour');
    await User.deleteMany({});
    console.log('data: successfully deleted to Users');
    await Review.deleteMany({});
    console.log('data: successfully deleted to Reviews');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] == '--import') {
  importData();
} else if (process.argv[2] == '--delete') {
  deleteData();
}
