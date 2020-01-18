'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/project/project.service');

// routes
router.post('/register', register);
router.put('/:id', update);
router.get('/:searchKey?', getAll);

module.exports = router;


function getAll(req, res, next) {
    let searchKey = req.params.searchKey;
    if (!searchKey)
        searchKey = "";
    service.getAll(searchKey)
        .then(users => res.json(users))
        .catch(err => next(err));
}

function register(req, res, next) {
    let { ...u } = req.body;
    u.created_by = req.user.userID;
    u.exp_date = req.expiration;

    service.register(u)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}

function update(req, res, next) {
    service.update(req.params.id, req.body)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}
