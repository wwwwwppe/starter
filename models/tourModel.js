const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  // 定义要求的条件
  name: {
    type: String,
    required: [true, '必须有一个名字'],
    unique: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  price: {
    type: String,
    required: [true, '必须有一个价格']
  }
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;