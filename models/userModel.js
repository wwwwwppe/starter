const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

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
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, '请确认你的密码'],
        validate: {
            validator: function(el) {
                return el === this.password;
            },
            message: '密码不同'
        }
    }
});

userSchema.pre('save', async function(next) {
    //如果密码正确就炮这个函数
    if (!this.isModified('password')) return next();
    
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password,12)
    
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword =async function(candidatePassword,userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
