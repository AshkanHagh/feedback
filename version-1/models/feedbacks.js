const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const commentSchema = new Schema({

    comment : {
        type : String,
        required : true,
        length : { min : 5, max : 255 }
    },
    senderId : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    }
}, {timestamps : true});


module.exports = mongoose.model('Comment', commentSchema);