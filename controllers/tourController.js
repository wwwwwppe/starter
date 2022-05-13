const fs = require('fs');
const Tour = require('./../models/tourModel');

/*const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);*/

/*exports.checkID = function(req, res, next, val) {
  console.log(`Tour id is: ${val}`);
  if (req.params.id * 1 > tours.length) {
    return res.status(404).json({
      status: 'false',
      message: 'Invalid ID'
    });
  }
  next();
};*/

/*exports.checkBody = function(req, res, next) {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'false',
      message: 'Missing name or price'
    });
  }
  next();
};*/

exports.getAllTours = async (req, res) => {
  // console.log(req.requestTime);
  try {
    const tours = await Tour.find();

    res.status(200).json({
      status: 'success',
      //requestedAt: req.requestTime
      result: tours.length,
      data: {
        tours
      }
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id})

    res.status(200).json({
      status: 'success',
      //results: tours.length,
      data: {
        tour
      }
    });
  } catch (e) {
    res.status(404).json({
      status: 'fail',
      message: e
    });
  }

  /*console.log(req.params);
  const id = req.params.id * 1;//用*是为了将前面的转化为数字
  const tour = tours.find(el => el.id === id);
  */
};

exports.createTour = async (req, res) => {

  try {
    // const newTour = new Tour({});
    // newTour.save;
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};
// console.log(req.body);
/*
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);

  fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    err => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour
        }
      });*/


exports.updateTour = (req, res) => {
  try {
    const tour = Tour.findByIdAndUpdate(req.params.id, req.body,{
      //设置必须更新的必须是不同的
      new: true
    })
    res.status(200).json({
      status: 'success',
      data: {
        tour: '<Update tour here>'
      }
    });
  } catch (err) {
      res.status(404).json({
        status: 'error',
        message : err
      })
  }
};

exports.deleteTour = (req, res) => {


  res.status(204).json({
    status: 'success',
    data: null
  });
};