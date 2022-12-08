const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name,email,photo,password,passwordConfirm

const userSchema = new mongoose.Schema({
    name: {
        type: String, required: [true, '请写出你的名字！']
    }, email: {
        type: String, required: [true, '请填写你的邮箱'], unique: true, //lowercase转化成小写
        lowercase: true, validate: [validator.isEmail, '请提供一个验证的']
    }, photo: String, role: {
        type: String, enum: ['user', 'guide', 'lead-guide', 'admin'], default: 'user'
    }, password: {
        type: String, required: [true, '请输入密码'], minlength: 8, select: false
    }, passwordConfirm: {
        type: String, required: [true, '请确认你的密码'], validate: {
            validator: function(el) {
                return el === this.password;
            }, message: '密码不同'
        }
    }, passwordChangedAt: Date, passwordResetToken: String, passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
    //如果密码正确就炮这个函数
    if (!this.isModified('password')) return next();
    
    //hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    this.passwordConfirm = undefined;
    next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        
        return JWTTimestamp < changeTimestamp; //
    }
    
    // False means NOT changed
    return false;
};

userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    
    console.log({ resetToken }, this.passwordResetToken);
    
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    
    return resetToken;
    
};

const User = mongoose.model('User', userSchema);

module.exports = User;
