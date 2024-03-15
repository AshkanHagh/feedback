const Message = require('../models/message');
const User = require('../models/user');


exports.getMessages = async (req, res, next) => {

    try {
        const message = await Message.find().populate('username', 'username');
        if(!message) {

            const error = new Error('Nothing found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({message : 'messages fethced', messages : message});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.getSingleMessage = async (req, res, next) => {

    try {
        const message = await Message.findById(req.params.id).populate('username', 'username');
        if(!message) {
            
            const error = new Error('nnothing found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({message : 'User message fetched', msg : message});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.deleteMessage = async (req, res, next) => {

    try {
        const message = await Message.findById(req.params.id);
        if(!message) {
            
            const error = new Error('nnothing found');
            error.statusCode = 404;
            throw error;
        }

        await message.deleteOne();

        const user = await User.findById(message.username.toString());

        user.messages.remove(req.params.id);

        await user.save();

        res.status(200).json({message : 'Message has been deleted', messageId : message._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}