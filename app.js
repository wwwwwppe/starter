const fs = require('fs');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routers/tourRoutes');
const userRouter = require('./routers/userRoutes');

const app = express();

// 1)
//console.log(process.env.NODE_ENV);
app.use(morgan('dev'));
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// }
app.use(express.json());
// 访问静态界面
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    console.log(req.headers);
    next();
});

// 3)
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//如果在上面的路径都没有匹配，则在下面会全部拦截，并且返回未找到
app.all('*', (req, res, next) => {
    // res.status(404).json({
    //     status: 'fail',
    //     message: `在服务器上无法找到 ${req.originalUrl} `
    // });
    // next();
    
    // const err = new Error(`在服务器上无法找到 ${req.originalUrl} `);
    // err.status = 'fail';
    // err.statusCode = 404;
    next(new AppError(`在服务器上无法找到 ${req.originalUrl} `));
});

app.use(globalErrorHandler);

// 4)
module.exports = app;




