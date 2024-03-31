const { validationResult } = require('express-validator');

const User = require('../models/user.js');
const Comment = require('../models/feedbacks.js');


exports.addComment = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const comment = new Comment({
            comment : req.body.comment,
            senderId : req.userId
        });

        await comment.save();

        res.status(201).json({message : 'thanks for your feedback', commentId : comment._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}