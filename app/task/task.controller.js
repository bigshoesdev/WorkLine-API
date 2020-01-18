'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/task/task.service');

// routes
router.post('/register', register);
router.post('/all', getAllTasks);
router.post('/get', getTask);
router.post('/update', updateTask);

module.exports = router;

function register(req, res, next) {
    let {...task } = req.body;
    service.register(task, req.user.userID)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}

function getAllTasks(req, res, next) {
    service.getAllTasks(req.user.userID)
        .then((data) => res.json({ success: true, data: data }))
        .catch(err => next(err));
}


function getTask(req, res, next) {
    service.getTask(req.body.id)
        .then((task) => res.json({ success: true, task: task }))
        .catch(err => next(err));
}

function updateTask(req, res, next) {
    let {...t } = req.body;

    service.updateTask(t)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}