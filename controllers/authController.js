const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id =>{
    return jwt.sign({id},process.env.JWT_SECRET,{
        expiresIn: process.env.JWT_EXPIRES_IN
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create(req.body);
    
    const token = signToken(newUser._id);
    res.status(201).json({
        status: 'success',
        token,
        data: {
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
        status: 'success',
        token
    });
});