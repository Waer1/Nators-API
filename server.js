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
  .then(() => console.log('DB connection successful!'))
  .catch((err) => console.log(err));

const port = process.env.PORT || 3000;

// SERVER
const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log(err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
