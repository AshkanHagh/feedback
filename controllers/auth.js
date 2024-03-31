const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.signup = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const { username, email, gender, password } = req.body;

        const isEmailExists = await User.findOne({username, email});
        if(isEmailExists) {

            const error = new Error('Sorry, this email or username is already in use. Please choose a different one.');
            error.statusCode = 409
            throw error;
        }

        const salt = await bcrypt.genSalt(12);
        const hashedPass = await bcrypt.hash(password, salt);

        const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${username}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${username}`;

        const user = new User({
            username,
            email,
            gender,
            password : hashedPass,
            profilePic : gender === 'male' ? boyProfilePic : girlProfilePic
        });

        await user.save();

        res.status(201).json({message : 'Account has been created', AccountId : user._id});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}


exports.login = async (req, res, next) => {

    try {
        const errors = validationResult(req);
        if(!errors.isEmpty()) {

            const error = new Error('invalid data from your data, please check your value');
            error.statusCode = 422;
            throw error;
        }

        const { email, password } = req.body;
        
        const user = await User.findOne({email});
        if(!user) {

            const error = new Error('Wrong Email, Please check your email');
            error.statusCode = 409;
            throw error;
        }

        const isPassword = await bcrypt.compare(password, user.password);
        if(!isPassword) {

            const error = new Error('Wrong Email, Please check your email');
            error.statusCode = 409;
            throw error;
        }

        const token = jwt.sign({email : user.email, userId : user._id, isAdmin: user.isAdmin}, process.env.JWT_SECRET, {expiresIn : '1d'});

        res.status(201).json({message : 'Welcome', AccountId : user._id, token});

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500
        }
        next(error);
    }

}