const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    username : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    gender : {
        type : String,
        required : true,
        enum : ['male', 'female']
    },
    password : {
        type : String,
        required : true,
        length : { min : 6 }
    },
    profilePic : {
        type : String,
        required : true,
        default : ''
    }

}, {timestamps : true});


module.exports = mongoose.model('User', userSchema);