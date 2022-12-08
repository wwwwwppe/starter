const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create(req.body);
    
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success', token, data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
    
    //1.如果邮箱或者密码错误
    if (!email || !password) {
        return next(new AppError('请提供邮箱和密码', 400));
    }
    //2.
    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('邮箱或则密码不正确'), 401);
    }
    
    //3.如果都没有问题，发送token给客户端
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success', token
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) 得到token和检查token是否存在
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return next(new AppError('你没有登录，请先登陆'), 401);
    }
    
    // 2) 验证token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    
    // 3) 检查用户是否还存在
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError('这个token没有对应的用户', 401));
    }
    
    
    // 4) 检查用户在发出令牌后是否更改了密码
    if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('用户已经更改密码，请重新输入', 401));
    }
    
    //授权访问受保护的路线
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles ['admin','lead-guide'],role = 'user'
        if (!roles.includes(req.user.role)) {
            return next(new AppError('你没权限做此行为', 403));
        }
        
        next();
    };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1)   得到绑定的邮箱
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('没有用户的密码', 404));
    }
    // 2)   生成随机的重置密码
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false});
    
    // 3)   发送到你的邮箱
});

exports.resetPassword = (req, res, next) => {

};