const dotenv = require('dotenv');
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('../../models/tourModel');

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

const importData = async () => {
  try {
    await Tour.create(toursData);
    console.log('data: successfully added to tour');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await Tour.deleteMany({});
    console.log('data: successfully deleted to tour');
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
