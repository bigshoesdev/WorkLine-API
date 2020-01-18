'use strict';

require('rootpath')();

var express = require('express');
var router = express.Router();
var service = require('app/reminder/reminder.service');

// routes
router.post('/top-reminders', getTopReminders);
router.post('/register', register);
router.post('/get', getReminder);
router.post('/update', updateReminder);



module.exports = router;

function getTopReminders(req, res, next) {
    console.log("User Get Top Reminders");
    service.getTopReminders(req.user.userID)
        .then(reminders => res.json({ success: true, reminders: reminders }))
        .catch(err => next(err));
}

function register(req, res, next) {
    let {...r } = req.body;
    r.user = req.user.userID;

    service.register(r, req.user.userID)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}

function getReminder(req, res, next) {
    service.getReminder(req.body.id)
        .then((reminder) => res.json({ success: true, reminder: reminder }))
        .catch(err => next(err));
}


function updateReminder(req, res, next) {
    let {...r } = req.body;

    service.updateReminder(r)
        .then(() => res.json({ success: true }))
        .catch(err => next(err));
}