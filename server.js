const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

process.on('uncaughtException', (err) => {
  console.log(err);
  console.log('UNCAUGHT EXCEPTION!, SHUTTING DOWN THE SERVER!');
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

const PORT = process.env.PORT || 3000;
const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connected sucessfully!'));

const server = app.listen(PORT, () => {
  console.log(`App is running at port ${PORT} ...`);
});

process.on('unhandledRejection', (err) => {
  console.log(err);
  console.log('Unhandled Rejection Shutting down server....');
  server.close(() => {
    process.exit(1);
  });
});
