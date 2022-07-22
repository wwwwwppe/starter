const mongoose = require('mongoose');
const validator = require('validator');

// name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '请写出你的名字！']
    },
    email: {
        type: String,
        required: [true, '请填写你的邮箱'],
        unique: true,
        //lowercase转化成小写
        lowercase: true,
        validate: [validator.isEmail, '请提供一个验证的']
    },
    photo: String,
    password: {
        type: String,
        required: [true, '请输入密码'],
        minlength: 8
    },
    passwordConfirm:{
        type: String,
        required: [true, '请确认你的密码']
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
