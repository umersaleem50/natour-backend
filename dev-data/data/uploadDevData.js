const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');
const Review = require('../../models/reviewModel');
const User = require('../../models/userModel');

dotenv.config({ path: `${__dirname}/../../config.env` });

const DB = process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASSWORD);

mongoose
  .connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log(`Database connected sucessfully!`);
  })
  .catch((err) => {
    console.log(err);
  });

// const toursData = JSON.parse(
//   fs.readFileSync(`${__dirname}/tours.json`, 'utf-8')
// );
// const reviewsData = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
// );
const usersData = JSON.parse(
  fs.readFileSync(`${__dirname}/users.json`, 'utf-8')
);

const importData = async () => {
  try {
    // await Tour.create(toursData);
    // await Review.create(reviewsData);
    await User.create(usersData);
    console.log(`Data imported sucessfully!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const deleteData = async () => {
  try {
    // await Tour.deleteMany();
    await User.deleteMany();
    // await Review.deleteMany();
    console.log(`Data deleted sucessfully!`);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteData();
}
