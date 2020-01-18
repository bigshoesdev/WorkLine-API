'use strict';

require('rootpath')();

var User = require('app/models/user.model');
var Task = require('app/models/task.model');
var TaskTime = require('app/models/task-time.model');
var EmployerTime = require('app/models/employer-time.model');
var moment = require('moment');
var _ = require('underscore');

module.exports = {
    getMonthDataForGeneral,
    getMonthDataForPersonal,
    getWeekDataForGeneral,
    getWeekTimeDataForGeneral,
    getWeekDataForPersonal,
    getWeekTimeDataForPersonal,
    getEmployeeMonthDataForPersonal,
    getEmployeeWeekDataForPersonal,
    getEmployeeWeekTimeDataForPersonal,
};

async function getMonthDataForGeneral(userID, month) {
    let user = await User.findById(userID).populate({ path: 'departments', select: 'name production' }).select('departments');

    let general = {
        days: 0,
        hours: 0,
        tasks: [],
        users: [],
        target_state: 0,
        target_attach: 0
    };

    let deptList = [];
    for (let dept of user.departments) {
        let tasks = await Task.find({ department: dept.id }).select('title user').populate({ path: 'user', select: 'name' });

        let taskIDs = tasks.map((task) => {
            return task.id
        });

        let users = [];
        users = _.unique(_.map(tasks, 'user'), 'id');

        let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: month.start_date, $lte: month.end_date } }).select('date hours');

        let hours = 0;

        for (let taskTime of taskTimes) {
            hours += taskTime.hours.length;
        }

        deptList.push({
            id: dept.id,
            name: dept.name,
            tasks: tasks,
            days: taskTimes.length,
            hours: hours,
            users: users,
            target_state: dept.production.target,
            target_attach: dept.production.value
        });

        general.days += taskTimes.length;
        general.hours += hours;
        general.target_state += dept.production.target;
        general.target_attach += dept.production.value;
        general.tasks = general.tasks.concat(tasks);
        general.users = general.users.concat(users);
    }
    general.users = _.unique(general.users, 'id');
    general.tasks = _.unique(general.tasks, 'id');

    return {
        general: general,
        deptList: deptList
    }
}

async function getWeekDataForGeneral(userID, week) {
    let user = await User.findById(userID).populate({ path: 'departments', select: 'name production' }).select('departments');

    let general = {
        days: 0,
        hours: 0,
        tasks: [],
        users: [],
        target_state: 0,
        target_attach: 0
    };

    let deptList = [];
    for (let dept of user.departments) {
        let tasks = await Task.find({ department: dept.id }).select('title user').populate({ path: 'user', select: 'name' });

        let taskIDs = tasks.map((task) => {
            return task.id
        });

        let users = [];
        users = _.unique(_.map(tasks, 'user'), 'id');

        let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: week.start_date, $lte: week.end_date } }).select('date hours');

        let hours = 0;

        for (let taskTime of taskTimes) {
            hours += taskTime.hours.length;
        }

        deptList.push({
            id: dept.id,
            name: dept.name,
            tasks: tasks,
            days: taskTimes.length,
            hours: hours,
            users: users,
            target_state: dept.production.target,
            target_attach: dept.production.value
        });

        general.days += taskTimes.length;
        general.hours += hours;
        general.target_state += dept.production.target;
        general.target_attach += dept.production.value;
        general.tasks = general.tasks.concat(tasks);
        general.users = general.users.concat(users);
    }

    general.users = _.unique(general.users, 'id');
    general.tasks = _.unique(general.tasks, 'id');

    return {
        general: general,
        deptList: deptList
    }
}

// weeek = { start_date, end_date, mode=0,1,2 id=0}  0:General 1:Task 2:User
async function getWeekTimeDataForGeneral(userID, week) {
    if (week.mode == 0) {
        let user = await User.findById(userID).populate({ path: 'departments', select: 'name production' }).select('departments');

        let deptIDs = user.departments.map((dept) => { return dept.id });

        let tasks = await Task.find({ department: { $in: deptIDs } }).select('title user').populate({ path: 'user', select: 'name' });

        let taskIDs = tasks.map((task) => { return task.id });

        let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    } else if (week.mode == 1) {
        let taskTimes = await TaskTime.find({ task: week.id, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    } else if (week.mode == 2) {
        let tasks = await Task.find({ user: week.id }).select('title user').populate({ path: 'user', select: 'name' });

        let taskIDs = tasks.map((task) => { return task.id });

        let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    } else if (week.mode == 3) {
        let tasks = await Task.find({ department: week.id }).select('title user').populate({ path: 'user', select: 'name' });

        let taskIDs = tasks.map((task) => { return task.id });

        let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    }
}

async function getMonthDataForPersonal(userID, month) {
    let general = {
        days: 0,
        hours: 0,
        target_state: 0,
        target_attach: 0
    };


    let employerTimes = await EmployerTime.find({ user: userID, date: { $gte: month.start_date, $lte: month.end_date } }).select('date hours');

    let hours = 0;

    for (let employerTime of employerTimes) {
        hours += employerTime.hours.length;
    }

    general.days = employerTimes.length;
    general.hours = hours;
    general.target_state = 1000;
    general.target_attach = 2000;

    let tasks = await Task.find({ created_by: userID }).select('title');
    return {
        general: general,
        taskList: tasks
    }
}

async function getWeekDataForPersonal(userID, week) {
    let general = {
        days: 0,
        hours: 0,
        target_state: 0,
        target_attach: 0
    };

    let employerTimes = await EmployerTime.find({ user: userID, date: { $gte: week.start_date, $lte: week.end_date } }).select('date hours');

    let hours = 0;

    for (let employerTime of employerTimes) {
        hours += employerTime.hours.length;
    }

    general.days = employerTimes.length;
    general.hours = hours;
    general.target_state = 1000;
    general.target_attach = 2000;

    let tasks = await Task.find({ created_by: userID }).select('title');
    return {
        general: general,
        taskList: tasks
    }
}

// weeek = { start_date, end_date, mode=0,1,2 id=0}  1:Task
async function getWeekTimeDataForPersonal(userID, week) {
    if (week.mode == 1) {
        let taskTimes = await TaskTime.find({ task: week.id, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    }
}

async function getEmployeeMonthDataForPersonal(userID, month) {
    let general = {
        days: 0,
        hours: 0,
        target_state: 0,
        target_attach: 0
    };

    let tasks = await Task.find({ user: userID }).select('title user').populate({ path: 'user', select: 'name' });

    let taskIDs = tasks.map((task) => { return task.id });

    let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: month.start_date, $lte: month.end_date } }).select('task date hours');

    for (let taskTime of taskTimes) {
        general.days += 1;
        general.hours += taskTime.hours.length;
    }

    general.target_state = 1000;
    general.target_attach = 2000;

    return {
        general: general,
        taskList: tasks
    }
}

async function getEmployeeWeekDataForPersonal(userID, week) {
    let general = {
        days: 0,
        hours: 0,
        target_state: 0,
        target_attach: 0
    };
    let tasks = await Task.find({ user: userID }).select('title user').populate({ path: 'user', select: 'name' });

    let taskIDs = tasks.map((task) => { return task.id });

    let taskTimes = await TaskTime.find({ task: { $in: taskIDs }, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

    for (let taskTime of taskTimes) {
        general.days += 1;
        general.hours += taskTime.hours.length;
    }

    general.target_state = 1000;
    general.target_attach = 2000;

    return {
        general: general,
        taskList: tasks
    }
}

// weeek = { start_date, end_date, mode=0,1 id=0} 1:Task
async function getEmployeeWeekTimeDataForPersonal(userID, week) {
    if (week.mode == 1) {
        let taskTimes = await TaskTime.find({ task: week.id, date: { $gte: week.start_date, $lte: week.end_date } }).select('task date hours');

        let result = {};

        for (let taskTime of taskTimes) {
            if (!result[taskTime.date]) {
                result[taskTime.date] = [];
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
            } else {
                result[taskTime.date] = result[taskTime.date].concat(taskTime.hours);
                result[taskTime.date] = _.unique(result[taskTime.date]);
            }
        }

        return result;
    }
}