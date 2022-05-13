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





// 重复提交会出现重复的错误，因为有一个unique的属性
/*const testTour = new Tour({
  name: 'The Park Camper',
  price: 997
});

testTour.save().then(doc =>{
  console.log(doc);
}).catch(err =>{
  console.log('ERROR:',err);
});*/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port http://127.0.0.1:${port}...`);
});


