'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/time/time.service');

// routes
router.post('/month-general', getMonthDataForGeneral);
router.post('/week-general', getWeekDataForGeneral);
router.post('/week-time-general', getWeekTimeDataForGeneral);
router.post('/month-personal', getMonthDataForPersonal);
router.post('/week-personal', getWeekDataForPersonal);
router.post('/week-time-personal', getWeekTimeDataForPersonal);
router.post('/employee-month-personal', getEmployeeMonthDataForPersonal);
router.post('/employee-week-personal', getEmployeeWeekDataForPersonal);
router.post('/employee-week-time-personal', getEmployeeWeekTimeDataForPersonal);


module.exports = router;

function getMonthDataForGeneral(req, res, next) {
    let {...month } = req.body;
    service.getMonthDataForGeneral(req.user.userID, month)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getWeekDataForGeneral(req, res, next) {
    let {...week } = req.body;
    service.getWeekDataForGeneral(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getWeekTimeDataForGeneral(req, res, next) {
    let {...week } = req.body;
    service.getWeekTimeDataForGeneral(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getMonthDataForPersonal(req, res, next) {
    let {...month } = req.body;
    service.getMonthDataForPersonal(req.user.userID, month)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getWeekDataForPersonal(req, res, next) {
    let {...week } = req.body;
    service.getWeekDataForPersonal(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getWeekTimeDataForPersonal(req, res, next) {
    let {...week } = req.body;
    service.getWeekDataForGeneral(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getEmployeeMonthDataForPersonal(req, res, next) {
    let {...month } = req.body;
    service.getEmployeeMonthDataForPersonal(req.user.userID, month)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}


function getEmployeeWeekDataForPersonal(req, res, next) {
    let {...week } = req.body;
    service.getEmployeeWeekDataForPersonal(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}

function getEmployeeWeekTimeDataForPersonal(req, res, next) {
    let {...week } = req.body;
    service.getEmployeeWeekTimeDataForPersonal(req.user.userID, week)
        .then((data) => {
            res.json({ success: true, data: data })
        })
        .catch(err => next(err));
}