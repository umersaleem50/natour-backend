const dotenv = require('dotenv');
const mongoose = require('mongoose');
const app = require('./app');

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

app.listen(PORT, () => {
  console.log(`App is running at port ${PORT} ...`);
});
