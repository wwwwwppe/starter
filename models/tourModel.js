const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    // 定义要求的条件
    name: {
        type: String,
        required: [true, '必须有一个名字'],
        unique: true,
        trim: true,
        maxlength: [40, '最多40个字'],
        minlength: [5, '最少5个字'],
        // validate: [validator.isAlpha, '名称只包含字符']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, '必须有一个持续时间']
    },
    maxGroupSize: {
        type: Number,
        required: [true, ' 必须有一个组大小']
    },
    difficulty: {
        type: String,
        required: [true, ' 必须有一个困难度'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: '有三种难度，简单，中等，困难'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, '至少为1'],
        max: [5, '最多为5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, '必须有一个价格']
    },
    priceDiscount: {
        type: Number,
        validate: {
            //这仅指向新文档创建的当前文档
            validator: function(val) {
                return val < this.price;
            },
            message: '({Value})应该低于正常价格'
        }
    },
    summary: {
        type: String,
        trim: true,   //trim删除空白在开始和结尾
        required: [true, '必须有一个描述']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, '必须有图片']
    },
    images: [String],   //相当于字符串数组
    createAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//中间件：运行在.save()和.create()前面
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

/*tourSchema.pre('save', function(next) {
    console.log('Will save document..');
    next();
});

tourSchema.post('save', function(doc, next) {
    console.log(doc);
    next();
});*/

//查询中间间
/*tourSchema.pre('find', function(next) {
    this.find({secretTour:{ $ne: true}});  //为true的隐藏，查询结果隐藏
    // 但是这里用id查询还是可以查询的到，因为findID在这里用的不是find，是findOne
    //所以可以使用正则表达式来匹配
    next();
});*/

//匹配所有以find开头的查询
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: { $ne: true } });  //为true的隐藏，查询结果隐藏
    // 但是这里用id查询还是可以查询的到，因为findID在这里用的不是find，是findOne

    this.start = Date.now();
    next();
});

tourSchema.post(/^find/, function(docs, next) {
    console.log(`查询了${Date.now() - this.start}毫秒`);
    //console.log(docs);
    next();
});

// 聚合中间件
tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    console.log(this.pipeline());
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;