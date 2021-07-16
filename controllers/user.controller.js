const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const formatContent = require('../utils/formatContent');
const User = require('../models/user.model');

let refreshUserList = {
    john: { password: "passwordjohn" },
    mary: { password: "passwordmary" }
}


module.exports.addUser = function (req, res) {

    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save(function (err, data) {
        if (err) {
            if (err.code == '11000') {
                formatContent.formatOutput(res, 'error', 409, 'user already exists', "");
            } else {
                res.status(400);
                res.send("User already exists...");
                formatContent.formatOutput(res, 'error', 400, 'Error while making request', "");
            }
            return;
        }

        formatContent.formatOutput(res, 'success', 200, 'User added to database successfully', data);
    });
};

module.exports.logout = function (req, res) {
    if (req.cookies['jwt']) {
        res
            .clearCookie('jwt')
            .status(200)
            .json({
                message: 'You have logged out'
            })
    } else {
        res.status(401).json({
            error: 'Invalid jwt'
        })
    }
}

module.exports.login = function (req, res) {

    const user = req.body;

    if (!user.email) {
        formatContent.formatOutput(res, 'error', 422, 'email is required for login', "");
    }

    if (!user.password) {
        formatContent.formatOutput(res, 'error', 422, 'password is required for login', "");
    }

    User.findOne({ email: user.email }, 'password', (err, userData) => {

        if (err) {
            formatContent.formatOutput(res, 'error', 401, 'Unable to login', "failure");
        } else {
            if (userData) {
                let valid = bcrypt.compareSync(
                    req.body.password,
                    userData.password
                );
                if (valid) {
                    //use the payload to store information about the user such as username, user role, etc.
                    let payload = { email: user.email }

                    //create the access token with the shorter lifespan
                    let accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
                        algorithm: "HS256",
                        expiresIn: process.env.ACCESS_TOKEN_LIFE
                    })

                    //create the refresh token with the longer lifespan
                    let refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
                        algorithm: "HS256",
                        expiresIn: process.env.REFRESH_TOKEN_LIFE
                    })

                    //store the refresh token in the user array
                    // if (!refreshUserList[user.email]) {
                    //     refreshUserList[user.email].refreshToken = refreshToken
                    // } else {
                    //     refreshUserList[user.email].refreshToken = refreshToken
                    // }
                    // .cookie('jwt',token, {    httpOnly: true,    secure: false //--> SET TO TRUE ON PRODUCTION})
                    //send the access token to the client inside a cookie
                    res.cookie("jwt", accessToken, { secure: false, httpOnly: true });
                    res.send();
                    //formatContent.formatOutput(res, 'success', 200, 'login Success', "success");
                } else {
                    formatContent.formatOutput(res, 'error', 401, 'Password incorrect', "failure");
                }
            } else {
                formatContent.formatOutput(res, 'error', 401, 'User not available', "failure");
            }
        }
    })
};