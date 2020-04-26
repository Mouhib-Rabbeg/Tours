const mongoose = require('mongoose');
const env = require('dotenv');
env.config({ path: './config.env' });
const app = require('./app');

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

//start server
app.listen(process.env.PORT, () => {
  console.log('running on port ', process.env.PORT);
});
