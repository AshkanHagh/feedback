const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');


exports.signup = async (req, res, next) => {

    try {
        

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500;
        }
        next(error);
    }

}

exports.login = async (req, res, next) => {

    try {
       

    } catch (error) {
        
        if(!error.statusCode) {

            error.statusCode = 500
        }
        next(error);
    }

}
