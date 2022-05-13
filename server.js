const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = require('./app');
// console.log(process.env);
dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD); //后面的replace是用DATABASE_PASSWORD代替DATABASE中的PASSWORD这样安全

mongoose
  // .connect(process.env.DATABASE_LOCAL,{    // 连接本地数据库
  .connect(DB, {                      //连接网络数据库
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

