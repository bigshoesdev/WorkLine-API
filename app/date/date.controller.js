'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/date/date.service');

// routes
router.post('/register', register);

module.exports = router;

function register(req, res, next) {
    let {...d } = req.body;

    service.register(d, req.user.userID)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}