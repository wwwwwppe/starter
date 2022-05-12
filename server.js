const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
// console.log(process.env);
dotenv.config({ path: './config.env' });

const DB = process.env.DATABSE.replace('<PASSWORD>')

mongoose.connect();

const port =process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

