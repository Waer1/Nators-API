const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const mongoose = require('mongoose');

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
  .then(() => console.log('DB connection successful!'));

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

const testTour = new Tour({
  name: 'the Park Camper',
  price: 998,
});

testTour
  .save()
  .then((doc) => console.log(doc))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

// SERVER
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
