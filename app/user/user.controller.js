'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/user/user.service');

// routes
router.get('/', getAll);
router.get('/employees', getAllEmployees);
router.get('/employers', getAllEmployers);
router.post('/tasks-info', getTasksAndInfoByID);
router.post('/employer-loc-time', updateEmployerLocationAndTime);
router.post('/employee-loc-time', updateEmployeeLocationAndTime);
router.post('/employee-time', getEmployeeTime);
router.post('/employee-accumulate', getEmployeeAccumulate);
router.post('/statistics', getStatisticsInfoByID);
router.post('/update-pro-billing', updateProductionAndBilling);
router.post('/update-status', updateStatus);
router.post('/send-alert', sendAlert);

module.exports = router;

function updateEmployerLocationAndTime(req, res, next) {
    service.updateEmployerLocationAndTime(req.user.userID, req.body)
        .then(users => { res.json({ success: true }) })
        .catch(err => next(err));
}

function updateEmployeeLocationAndTime(req, res, next) {
    service.updateEmployeeLocationAndTime(req.user.userID, req.body)
        .then(users => { res.json({ success: true }) })
        .catch(err => next(err));
}

function getAll(req, res, next) {
    service.getAll()
        .then(users => { res.json({ success: true, users: users }) })
        .catch(err => next(err));
}

function getAllEmployees(req, res, next) {
    service.getAllEmployees()
        .then(users => { res.json({ success: true, users: users }) })
        .catch(err => next(err));
}

function getAllEmployers(req, res, next) {
    service.getAllEmployers()
        .then(users => { res.json({ success: true, users: users }) })
        .catch(err => next(err));
}

function getTasksAndInfoByID(req, res, next) {
    service.getTasksAndInfoByID(req.body.id)
        .then(data => { res.json({ success: true, data: data }) })
        .catch(err => next(err));
}

function getStatisticsInfoByID(req, res, next) {
    service.getStatisticsInfoByID(req.body.id)
        .then(data => { res.json({ success: true, data: data }) })
        .catch(err => next(err));
}

function updateProductionAndBilling(req, res, next) {
    let {...r } = req.body;

    service.updateProductionAndBilling(r)
        .then((data) => res.json({ success: true, user: data.user }))
        .catch(err => next(err));
}

function updateStatus(req, res, next) {

    service.updateStatus(req.user.userID, req.body)
        .then((data) => res.json({ success: true, user: data.user }))
        .catch(err => next(err));
}

function getEmployeeTime(req, res, next) {
    service.getEmployeeTime(req.user.userID, req.body)
        .then(data => { res.json({ success: true, data: data }) })
        .catch(err => next(err));
}

function getEmployeeAccumulate(req, res, next) {
    service.getEmployeeAccumulate(req.user.userID, req.body)
        .then(data => { res.json({ success: true, data: data }) })
        .catch(err => next(err));
}

function sendAlert(req, res, next) {
    service.sendAlert(req.body)
        .then(data => { res.json({ success: true, data: data }) })
        .catch(err => next(err));
}