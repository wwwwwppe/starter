const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Json = require('eslint-plugin-import/memo-parser');
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


// 读取JSON文件
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf8')); // 要使用目录名，__dirname

//将数据导入DB数据库
const importData = async () => {
  try {
    await Tour.create(tours);
    console.log('数据成功导入');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // 比较激进的功能，退出
};

// 删除所有的数据从数据库
const deleteData = async () => {
  try {
    await Tour.deleteMany();  //传入某样东西就会删除该文档，不传全删
    console.log('数据删除成功');
  } catch (err) {
    console.log(err);
  }
  process.exit(); // 比较激进的功能
};

//argv[2]  表示第三个函数， 可以用console.log(process.argv)查看
if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
