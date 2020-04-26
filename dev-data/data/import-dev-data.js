const fs = require('fs');
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');
const mongoose = require('mongoose');
const env = require('dotenv');
env.config({ path: '../../config.env' });

//connect mongoose
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log('connected !');
  });

//READ FILE

const tours = JSON.parse(fs.readFileSync('./tours.json', 'utf-8'));
const users = JSON.parse(fs.readFileSync('./users.json', 'utf-8'));
const reviews = JSON.parse(fs.readFileSync('./reviews.json', 'utf-8'));

//IMPORT DATA TO DATABASE

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validatebeforeSave: false });
    await Review.create(reviews);
    console.log('data successfully loaded !');
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

const deleteData = async () => {
  try {
    await Review.deleteMany();
    await Tour.deleteMany();
    await User.deleteMany();
    console.log('data successfully deleted !');
    process.exit();
  } catch (err) {}
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
} else {
  console.log('command is invalid !');
}
