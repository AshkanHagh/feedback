const { validationResult } = require('express-validator');

const Message = require('../models/message');
const User = require('../models/user');


exports.createMessage = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const message = new Message({

            message : req.body.message,
            username : req.userId
        });

        const result = await message.save();

        const user = await User.findById(req.userId);

        user.messages.push(result);

        const username = await user.save();

        res.status(201).json({message : 'Your message has been sended', msg : result, username});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}