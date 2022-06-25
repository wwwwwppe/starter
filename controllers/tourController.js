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

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        const queryObj = { ...this.queryString };
        // 这儿是用来去除包括里面的字符串
        const excludeFields = ['page', 'sort', 'limit', 'fields'];
        excludeFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        //console.log(JSON.parse(queryStr));
        this.query = this.query.find(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const field = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select('name duration price');
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

exports.getAllTours = async (req, res) => {
    // console.log(req.requestTime);
    try {
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

//没有异步的话会显示失败
exports.updateTour = async (req, res) => {
    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            //设置必须更新的必须是不同的
            new: true,
            //要符合验证器中的规则
            runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'error',
            message: err
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        //这儿删除不返回
        await Tour.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(404).json({
            status: 'error',
            message: err
        });
    }
};

exports.getTourStats = async (req, res) => {
    try {
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
                    _id: {$toUpper: '$difficulty'},
                    numTours: { $sum: 1 },
                    numRatings: { $sum: '$ratingsQuantity' },
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' }
                }
            },
            {
                $sort: { avgPrice: 1}
            },
            {
                //作用是去除id为EASY的
                $match: {__id:{ $ne: 'EASY'}}
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};