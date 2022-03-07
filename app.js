const express = require('express');

const app = express();

const PORT = 3000;

app.get('/', (req, res) => {
  res
    .status(200)
    .json({ message: 'You got a message from root!', app: 'natours' });
});

app.post('/', (req, res) => {
  res.send('You have done a post request!');
});

app.listen(PORT, () => {
  console.log(`App is running at port ${PORT} ...`);
});
