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
    password : {
        type : String,
        requried : true,
        length : {min : 8}
    },
    messages : [{
        type : Schema.Types.ObjectId,
        ref : 'Message',
    }]
}, {timestamps : true});


module.exports = mongoose.model('User', userSchema);