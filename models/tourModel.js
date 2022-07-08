const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema({
    // 定义要求的条件
    name: {
        type: String,
        required: [true, '必须有一个名字'],
        unique: true
    },
    slug:String,
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
        required: [true, ' 必须有一个困难度']
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
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
        type: Number
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
    startDates: [Date]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

//中间件：运行在.save()和.create()前面
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name,{ lower: true });
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

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;