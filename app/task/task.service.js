'use strict';

require('rootpath')();

var Task = require('app/models/task.model');
var User = require('app/models/user.model');
var moment = require('moment');

module.exports = {
    register,
    getAllTasks,
    getTask,
    updateTask
};

async function register(task, userID) {
    if (!task.title || !task.description) {
        throw 'Incorrect task information.';
    }

    let t = new Task(task);

    t.start_date = moment(new Date()).format('YYYY-MM-DD');
    t.end_date = task.date;
    t.created_by = userID;

    await t.save();

    let createdUser = await User.findById(t.created_by);
    let user = await User.findById(t.user);

    if (user.device_token && global.firebaseAdmin && t.alert) {
        var payload = {
            data: {
                'title': 'New Task has been assigned to you.',
                'message': 'Hello, Employer ' + createdUser.name + ' created new task for you. The task is ' + t.title + ''
            },
            notification: {
                title: 'New Task has been assigned to you',
                body: 'Hello, Employer ' + createdUser.name + ' created new task for you. The task is ' + t.title + '',
            }
        };

        var option = {
            priority: 'high',
            timeToLive: 180 * 60 * 24
        }

        global.firebaseAdmin.messaging().sendToDevice(user.device_token, payload, option).then((response) => {
            console.log(response);
        })
    }

}

async function getAllTasks(userID) {
    let tasks = await Task.find({ user: userID }).select('title description start_date user').populate({ path: 'user', select: 'name' });
    return {
        taskList: tasks
    }
}

async function getTask(id) {
    let task = await Task.findById(id);

    return task;
}

async function updateTask(t) {
    let task = await Task.findById(t.id);

    task.title = t.title;
    task.description = t.description;
    task.end_date = t.date;
    task.status = t.status;
    task.alert = t.alert;

    await task.save();
}