const User = require('../models/user');
const Feedback = require('../models/feedbacks');


exports.getAllSignedUsers = async (req, res, next) => {

    try {
        const user = await User.findById(req.userId);
        if(!user.isAdmin) {

            const error = new Error('Access denied. You are not authorized to access this resource.');
            error.statusCode = 403;
            throw error;
        }

        const users = await User.find({isAdmin : false}).select('-password');
        if(!users) {

            const error = new Error('Sorry, the requested users could not be found.');
            error.statusCode = 404;
            throw error;
        }

        const quantity = await User.find({isAdmin : false}).countDocuments();

        res.status(200).json({message : 'Users is here', quantity, users});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.getAllFeedbacks = async (req, res, next) => {

    try {
        const user = await User.findById(req.userId);
        if(!user.isAdmin) {

            const error = new Error('Access denied. You are not authorized to access this resource.');
            error.statusCode = 403;
            throw error;
        }

        const feedback = await Feedback.find().populate('senderId', 'username');
        if(!feedback) {

            const error = new Error('Sorry, the requested feedbacks could not be found.');
            error.statusCode = 404;
            throw error;
        }

        const quantity = await Feedback.find().countDocuments();

        res.status(200).json({message : 'feedbacks is here', quantity, feedback});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}