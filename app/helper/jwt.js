'use strict';

require('rootpath')();

var expressJwt = require('express-jwt');
var config = require('app/config/config');
var userService = require('app/user/user.service');

module.exports = jwt;

function jwt() {
    var secret = config.secret;
    return expressJwt({ secret: secret, isRevoked: isRevokedCallBack }).unless({
        path: [
            '/api/user/signin',
            '/api/user/signup',
            '/api/user/signout',
            '/',
            /\/asset*/,
        ]
    });
}

async function isRevokedCallBack(req, payload, done) {
    const user = await userService.getById(payload.userID);

    if (!user) {
        return done(null, true);
    }

    done();
};