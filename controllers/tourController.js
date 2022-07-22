const fs = require('fs');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

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

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};


exports.getAllTours = catchAsync(async (req, res, next) => {
    // console.log(req.requestTime);
    //console.log(req.query);
    // 1A) Filtering
    // const queryObj = { ...req.query };
    // // 这儿是用来去除包括里面的字符串
    // const excludeFields = ['page', 'sort', 'limit', 'fields'];
    // excludeFields.forEach(el => delete queryObj[el]);
    //
    // // 1B) Advanced filtering
    // let queryStr = JSON.stringify(queryObj);
    // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));
    //
    // let query = Tour.find(JSON.parse(queryStr));
    
    // 2)Sorting
    // if (req.query.sort) {
    //     const sortBy = req.query.sort.split(",").join(" ");
    //     console.log(sortBy);
    //     query = query.sort(sortBy);
    // } else {
    //     query = query.sort("-createdAt");
    // }
    
    // 3) Filed Limiting
    // if (req.query.fields) {
    //     const field = req.query.fields.split(",").join(" ");
    //     query = query.select("name duration price");
    // } else {
    //     query = query.select("__v");
    // }
    
    // const tours = await Tour.find({
    //     duration: 5,
    //     difficulty: 'easy'
    // });
    
    // const tours = await Tour.find()
    //     .where('duration')
    //     .equals(5)
    //     .where('difficulty')
    //     .equals('easy');
    
    // 4）Pagination
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = (page - 1) * limit;
    //
    // query = query.skip(skip).limit(limit);
    
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();
    const tours = await features.query;
    
    res.status(200).json({
        status: 'success',
        //requestedAt: req.requestTime
        result: tours.length,
        data: {
            tours
        }
    });
});


exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id})
    
    if (!tour) {
        return next(new AppError('No tour find with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        //results: tours.length,
        data: {
            tour
        }
    });
    
    /*console.log(req.params);
    const id = req.params.id * 1;//用*是为了将前面的转化为数字
    const tour = tours.find(el => el.id === id);
    */
});


exports.createTour = catchAsync(async (req, res, next) => {
    const newTour = await Tour.create(req.body);
    
    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
    // try {
    //     // const newTour = new Tour({});
    //     // newTour.save;
    //
    // } catch (err) {
    //     res.status(400).json({
    //         status: 'fail',
    //         message: err
    //     });
    // }
});
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

//没有异步的话会显示失败
exports.updateTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        //设置必须更新的必须是不同的
        new: true,
        //要符合验证器中的规则
        runValidators: true
    });
    
    if (!tour) {
        return next(new AppError('No tour find with that ID', 404));
    }
    
    res.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
});

exports.deleteTour = catchAsync(async (req, res, next) => {
    //这儿删除不返回
    const tour = await Tour.findByIdAndDelete(req.params.id);
    
    if (!tour) {
        return next(new AppError('No tour find with that ID', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
    
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            //这儿出现了一个比较低级的错误，price中的类型开始错误的设计为String
            //花了很大的功夫才发现是数据库类型错误，后将其改为Number
            $group: {
                //$toUpper是将难度改为大写
                //后面的$difficulty是根据数据库里面的difficulty来排序
                _id: { $toUpper: '$difficulty' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {
            $sort: { avgPrice: 1 }
        }/*,
            {
                //作用是去除id为EASY的
                $match: {__id:{ $ne: 'EASY'}}
            }*/
    ]);
    
    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
    
});

//这里可以做搜索
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    //这可太💢了，之前这里写出了$ls，然后报错"ok": 0, "code": 2, "codeName": "BadValue"
                    //以为是版本的问题结果是这里打错了
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                //_id是月份
                _id: { $month: '$startDates' },
                //统计有多少个
                numTourStarts: { $sum: 1 },
                //表示数组中有几个旅游的名字
                tours: {
                    $push: '$name'
                }
            }
        },
        //将_id变成month
        {
            $addFields: { month: '$_id' }
        },
        //隐藏_id，$project中1表示出现，0便是隐藏
        {
            $project: {
                _id: 0
            }
        },
        //$sort排序
        {
            $sort: { numTourStarts: -1 }
        },
        //限制查询数目
        {
            $limit: 12
        }
    
    ]);
    
    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});