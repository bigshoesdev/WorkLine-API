'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/department/department.service');

// routes
router.post('/employees', getEmployeesByDeptID);
router.post('/info', getDepartInfo);
router.post('/register', register);
router.post('/update-pro-billing', updateProductionAndBilling);
router.post('/statistics', getStatisticsInfoByID);

module.exports = router;

function getEmployeesByDeptID(req, res, next) {
    service.getEmployeesByDeptID(req.body.id)
        .then(users => res.json({ success: true, users: users }))
        .catch(err => next(err));
}

function register(req, res, next) {
    let { ...r } = req.body;
    department.user = req.user.userID;

    service.register(r)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}

function updateProductionAndBilling(req, res, next) {
    let { ...r } = req.body;

    service.updateProductionAndBilling(r)
        .then((data) => res.json({ success: true, department: data.department }))
        .catch(err => next(err));
}

function getDepartInfo(req, res, next) {
    service.getDepartInfo(req.body.id)
        .then(data => res.json({ success: true, data: data }))
        .catch(err => next(err));
}

function getStatisticsInfoByID(req, res, next) {
    service.getStatisticsInfoByID(req.body.id)
        .then(data => res.json({ success: true, data: data }))
        .catch(err => next(err));
}