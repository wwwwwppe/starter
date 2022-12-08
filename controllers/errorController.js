const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}:${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    
    const message = `复制文件的值:${value}。请使用其他的值`;
    return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(er => el.message);
    
    const message = `无效的输入数据.${errors.join('. ')}`;
    return new AppError(message, 400);
};

const handleJWTError = err => new AppError('token无效，请重新登录', 401);

const handleJWTExpiredError = err => new AppError('你的token已经过期，请重新登录');

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status, error: err, message: err.message, stack: err.stack
    });
};


const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status, message: err.message
        });
        
    } else {
        //1.错误日志
        console.error('ERROR', err);
        
        //2.发送出错消息
        res.status(500).json({
            status: 'error', message: '有些地方出错了'
        });
    }
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        //console.log(error.name);
        console.log(err);
        //这儿是一个问题，没有找到.name，所以在这里直接将其屏蔽
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();
        //console.log(error.isOperational);
        sendErrorProd(error, res);
        
    }
};