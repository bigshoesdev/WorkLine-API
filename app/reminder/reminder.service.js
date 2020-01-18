'use strict';

require('rootpath')();

var moment = require('moment');

var Reminder = require('app/models/reminder.model');

module.exports = {
    register,
    getTopReminders,
    getReminder,
    updateReminder
};

async function getTopReminders(id) {
    let date = new Date();

    let startDate = moment(new Date()).format('YYYY-MM-DD HH:mm');

    let reminders = await Reminder.find({ user: id, date: { $gte: startDate } });

    return reminders;
}

async function register(r, userID) {
    if (!r.title || !r.description) {
        throw 'Incorrect reminder information.';
    }

    let reminder = new Reminder(r);

    await reminder.save();
}

async function getReminder(id) {
    let reminder = await Reminder.findById(id);

    return reminder;
}

async function updateReminder(r) {
    let reminder = await Reminder.findById(r.id);

    reminder.title = r.title;
    reminder.description = r.description;
    reminder.alert = r.alert;

    await reminder.save();
}