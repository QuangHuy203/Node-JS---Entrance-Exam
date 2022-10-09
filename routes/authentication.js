const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/users.model');
const Token = require('../models/tokens.model');
const bcrypt = require('bcrypt');
const { signupValidation, signInValidation } = require('../common/validation');
const { JWT_CONFIG } = require('../common/constants');

router.post('/sign-up', async (req, res) => {
    let { firstName, lastName, email, password } = req.body;

    try {
        firstName = firstName.trim();
        lastName = lastName.trim();
        password = password.trim();
        email = email.trim();

        //Validate the data 
        const {error} = signupValidation({ firstName, lastName, email, password });

        if (error) {
            return res.status(400).json({
                status: 'FAILED',
                message: error.details[0].message
            });
        }

        //Checking if user already exists
        const existUser = await User.getByEmail(email);

        if (existUser !== null) {
            res.status(400).json({
                status: 'FAILED',
                message: 'User with the provided email already exists'
            });
        } else {
            //Create new User

            //Password handling
            const saltRounds = await bcrypt.genSalt(10);
            let hashPassword = await bcrypt.hash(password, saltRounds);
            let userInput = {};

            let date = new Date();
            
            userInput = {
                firstName,
                lastName,
                email,
                password: hashPassword,                    
                createdAt: convertDate(date.toISOString())
            };

            console.log(userInput);

            const newUser = await User.create(userInput);
            delete newUser.password;

            if (newUser !== null) {
                res.status(201).json({
                    displayName: newUser.firstName + ' ' + newUser.lastName,
                    ...newUser
                });
            }
        }   
    } catch (err) {
        console.error('[ERROR] /sign-up [Detail]:', err);
        res.status(500).json({
            status: 'FAILED',
            message: err.message
        });
    }
});

router.post('/sign-in', async (req, res) => {
    let { email, password } = req.body;

    try {
        email = email.trim();
        password = password.trim();

        //validate info
        const { error } = signInValidation({ email, password });
        if (error) {
            console.info('[ERROR] User information invalid');
            return res.status(400).json({
                status: 'FAILED',
                message: error.details[0].message
            });
        }

        //get user information
        const userData = await User.getByEmail(email);

        if (userData === null) {
            console.info('[ERROR] User data does not exist');
            return res.status(400).json({
                status: 'FAILED',
                message: 'Invalid email'
            });
        }

        //check password
        const validPassword = await bcrypt.compare(password, userData.password);
        if (!validPassword) {
            return res.status(400).json({
                status: 'FAILED',
                message: 'Invalid password'
            });
        }

        const accountInfo = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            displayName: userData.firstName + ' ' + userData.lastName
        };

        const accessToken = jwt.sign(accountInfo, JWT_CONFIG.TOKEN_KEY, {expiresIn: JWT_CONFIG.TOKEN_LIFE_TIME});
        const refreshToken = jwt.sign(accountInfo, JWT_CONFIG.REFRESH_TOKEN_KEY, {expiresIn: JWT_CONFIG.REFRESH_TOKEN_LIFE_TIME});

        let date = new Date();

        const tokenInput = {
            userId: userData.id,
            refreshToken: refreshToken,
            expiresIn: JWT_CONFIG.REFRESH_TOKEN_LIFE_TIME,
            createdAt: convertDate(date.toISOString()),
            updatedAt: convertDate(date.toISOString())
        };
       
        await Token.create(tokenInput);

        console.info('[INFO] Sign-in successfully by user:', accountInfo.displayName);
        res.status(200).json({
            user: accountInfo,
            token: accessToken,
            refreshToken: refreshToken
        });
    } catch (err) {
        console.error('[ERROR] /sign-in [Detail]:', err);
        res.status(500).json({
            status: 'FAILED',
            message: 'ERROR'
        });
    }
});

router.post('/refresh-token', async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken || refreshToken === '') return res.status(404).send('Invalid request');

    jwt.verify(refreshToken, JWT_CONFIG.REFRESH_TOKEN_KEY, async (err, decoded) => {
        if (err) return res.status(404).send(err.message);
        console.log(decoded);

        const userData = await User.getByEmail(decoded.email);

        delete decoded.exp;
        delete decoded.iat;

        const newToken = jwt.sign(decoded, JWT_CONFIG.TOKEN_KEY, {expiresIn: JWT_CONFIG.TOKEN_LIFE_TIME});
        const newRefreshToken = jwt.sign(decoded, JWT_CONFIG.REFRESH_TOKEN_KEY, {expiresIn: JWT_CONFIG.REFRESH_TOKEN_LIFE_TIME});

        //update new Token
        let date = new Date();
        const input = {
            refreshToken: newRefreshToken,
            userId: userData.id,
            updatedAt: convertDate(date.toISOString())
        };
        const result = await Token.update(input);

        if (result !== null) {
            return res.status(200).json({
                token: newToken,
                refreshToken: newRefreshToken
            });
        }
         
        res.status(500).json({
            status: 'FAILED',
        });
    });
});


router.post('/sign-out', async (req, res) => {
    const { email } = req.body;
    try {
        const userData = await User.getByEmail(email);

        if (userData === null || userData == undefined) return res.status(401).json({status: 'FAILED'});

        await Token.deleteByUserId(userData.id);
        res.status(204).json();
    } catch (err) {
        console.error('[ERROR] /sign-out [Detail]:', err);
        res.status(500).json();
    }
});

const convertDate  = (date) => {
    return date.split('T')[0] + ' ' + date.split('T')[1].split('.')[0];
};

module.exports = router;