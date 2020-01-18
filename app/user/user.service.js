'use strict';

require('rootpath')();

var bcrypt = require('bcrypt');
var User = require('app/models/user.model');
var Position = require('app/models/position.model');
var Department = require('app/models/department.model');
var Task = require('app/models/task.model');
var TaskTime = require('app/models/task-time.model');
var EmployerTime = require('app/models/employer-time.model');
var EmployeeTime = require('app/models/employee-time.model');
var moment = require('moment');

var _ = require('underscore');

module.exports = {
    signin,
    signup,
    getById,
    getAll,
    getAllEmployees,
    getAllEmployers,
    getTasksAndInfoByID,
    getStatisticsInfoByID,
    updateProductionAndBilling,
    updateStatus,
    updateEmployerLocationAndTime,
    updateEmployeeLocationAndTime,
    getEmployeeTime,
    getEmployeeAccumulate,
    sendAlert
};

function signin(req, name, code, done) {
    User.findOne({ 'name': name },
        function(err, user) {
            if (err)
                return done(err);

            if (!user) {
                return done(null, false, { 'message': 'The user with this credential does not exist.' });
            }

            if (user.type != req.body.type) {
                return done(null, false, { 'message': "You don't have permission to sign in." });
            }

            if (!bcrypt.compareSync(code, user.code)) {
                return done(null, false, { 'message': 'Invalid Code.' });
            }
            user.device_token = req.body.device_token;
            user.save();

            return done(null, user);
        }
    ).populate({ path: 'departments', select: 'name production billing startTime endTime' }).populate({ path: 'department', select: 'name production billing' }).populate({ path: 'position', select: 'name' });
}

function signup(req, name, code, done) {
    process.nextTick(async function() {
        try {
            let user = await User.findOne({ 'name': name });

            if (user) {
                return done(null, false, { message: 'The user with this name is already existed.' });
            }

            let position = await Position.findOne({}).sort({ order: -1 });
            let department = await Department.findOne();

            var u = new User();

            u.name = name;
            u.code = bcrypt.hashSync(code, 10);
            u.mobile = req.body.mobile;
            u.type = req.body.type;
            u.avatar = '';

            if (position)
                u.position = position._id;
            if (department)
                u.department = department._id;

            u.departments = [];

            if (u.type == 1) { // Employer
                let departments = await Department.find().select('id');
                departments.map((department) => {
                    u.departments.push(department.id);
                })
            }

            await u.save();

            return done(null, u);
        } catch (e) {
            console.log(e);
            return done(null, false, { message: 'There is an error in registering an user.' });
        }
    });
}

async function getById(id) {
    return await User.findById(id);
}

async function getAll() {
    return await User.find({});
}

async function getAllEmployees() {
    return await User.find({ type: 0 });
}

async function getAllEmployers() {
    return await User.find({ type: 1 });
}

async function getTasksAndInfoByID(userID) {
    let user = await User.findById(userID).populate({ path: 'department', select: 'name' }).populate({ path: 'position', select: 'name' });
    let tasks = await Task.find({ user: userID });

    return {
        user: user,
        tasks: tasks
    }
}

async function getStatisticsInfoByID(userID) {
    let user = await User.findById(userID);

    let tasks = await Task.find({ user: userID }).select('id');
    let taskIDs = tasks.map((task) => { return task.id });
    let taskTimes = await TaskTime.find({ task: { $in: taskIDs } }).select('date hours');

    let total_day = 0;
    let total_hour = 0;

    for (let taskTime of taskTimes) {
        total_day++;
        total_hour += taskTime.hours.length;
    }

    // 0: Active 1: Cancelled 2: Paused 3: Ended
    let endedTasks = await Task.find({ user: userID, status: 3 }).count();
    let activeTasks = await Task.find({ user: userID, status: 0 }).count();
    let pauseTasks = await Task.find({ user: userID, status: 2 }).count();
    let cancelTasks = await Task.find({ user: userID, status: 1 }).count();

    return {
        production: user.production,
        billing: user.billing,
        time: {
            total_hour: {
                value: total_hour,
                max: 300
            },
            work_day: {
                value: total_day,
                max: 30
            },
            holiday: {
                value: 12,
                max: 30
            },
            off_work: {
                value: 12,
                max: 30
            },
            personal_day: {
                value: 12,
                max: 30
            }
        },
        task: {
            ended: endedTasks,
            active: activeTasks,
            pause: pauseTasks,
            cancel: cancelTasks
        }
    };
}

async function getEmployeeTime(userID, data) {
    let employeeTime = await EmployeeTime.findOne({ user: userID, date: data.date });

    if (employeeTime) {
        return employeeTime;
    } else
        return { times: [] };
}

// type 0:day 1:month 2:year
async function getEmployeeAccumulate(userID, data) {
    let result = [];

    let date = moment(data.date);
    if (data.type == 0) {

        let startDate = getFirstDateOfWeek(date);

        for (let i = 0; i < 7; i++) {
            let employeeTimes = await EmployeeTime.find({ user: userID, date: startDate.format('YYYY-MM-DD') }).select('date hours');


            let hours = 0;
            for (let employeeTime of employeeTimes) {
                hours += employeeTime.hours.length;
            }

            result.push({
                text: startDate.format('DD, MMM'),
                hours: hours
            });

            startDate.add(1, 'days');
        }
    } else if (data.type == 1) {
        let firstDateOfMonth = moment(new Date(date.year(), date.month(), 1));
        let lastDateOfMonth = moment(new Date(date.year(), date.month() + 1, 0));

        let index = 0;
        const weekLabel = ['1st', '2nd', '3rd', '4th', '5th'];
        while (firstDateOfMonth < lastDateOfMonth) {
            let startDateOfWeek = getFirstDateOfWeek(firstDateOfMonth);

            let employeeTimes = await EmployeeTime.find({ user: userID, date: { $gte: startDateOfWeek.format('YYYY-MM-DD'), $lte: startDateOfWeek.add(6, 'days').format('YYYY-MM-DD') } }).select('date hours');


            let hours = 0;
            for (let employeeTime of employeeTimes) {
                hours += employeeTime.hours.length;
            }

            result.push({
                text: weekLabel[index] + ' Week',
                hours: hours
            });

            index++;

            firstDateOfMonth.add(7, 'days');
        }
    } else if (data.type == 2) {
        let firstDateOfYear = moment(new Date(date.year(), 0, 1));
        for (let i = 0; i < 12; i++) {
            let startDateOfMonth = firstDateOfYear.clone();
            let endDateOfMonth = moment(new Date(startDateOfMonth.year(), startDateOfMonth.month() + 1, 0));
            let employeeTimes = await EmployeeTime.find({ user: userID, date: { $gte: startDateOfMonth.format('YYYY-MM-DD'), $lte: endDateOfMonth.format('YYYY-MM-DD') } }).select('date hours');

            let hours = 0;
            for (let employeeTime of employeeTimes) {
                hours += employeeTime.hours.length;
            }

            result.push({
                text: startDateOfMonth.format('MMMM, YYYY'),
                hours: hours
            });

            firstDateOfYear.add(1, 'months');
        }
    }
    return result;
}

async function updateProductionAndBilling(data) {
    let user = await User.findById(data.id);

    let diffWithPrev = 0;

    diffWithPrev = parseInt(data.value) - parseInt(user.production.value);

    if (data.type == 0) {
        user.production = {
            target: user.production.target,
            value: parseInt(data.value)
        }

    } else {
        user.billing = {
            target: user.billing.target,
            value: parseInt(data.value)
        }
    }

    await user.save();

    if (data.type == 0) {
        let dept = await Department.findById(user.department);

        dept.production = {
            target: dept.production.target,
            value: dept.production.value + diffWithPrev
        }

        await dept.save();
    }

    return {
        user: user
    }
}

async function updateStatus(id, data) {
    let user = await User.findById(id);

    user.status = data.status ? 1 : 0;

    user.save();

    return user;
}

async function sendAlert(data) {
    let user = await User.findById(data.id);
    console.log(user);

    let title = '';
    let body = '';

    switch (data.alert) {
        case 1:
            title = 'Alert : You are being late for 10 minutes';
            body = 'You are 10 minutes late for the work.';
            break;
        case 2:
            title = 'Alert : You are being late for 20 minutes';
            body = 'You are 20 minutes late for the work.';
            break;
        case 3:
            title = 'Alert : You are being late for 30 minutes';
            body = 'You are 30 minutes late for the work.';
            break;
        case 4:
            title = 'Alert : You are being late for 1 hour';
            body = 'You are 1 hour late for the work.';
            break;
    }

    if (user) {
        if (user.device_token && global.firebaseAdmin) {
            var payload = {
                data: {
                    'title': title,
                    'message': body
                },
                notification: {
                    title: title,
                    body: body
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

    return user;
}

async function updateEmployerLocationAndTime(userID, data) {
    const d = moment(new Date());
    if (userID) {
        const date = d.format('YYYY-MM-DD');
        const hour = d.hours();

        let user = await User.findById(userID);

        user.location = {
            lat: data.lat,
            long: data.long
        }

        user.save();

        let employerTime = await EmployerTime.findOne({ user: userID, date: date });

        if (employerTime) {
            const hours = employerTime.hours;
            if (hours.length > 0) {
                if (hours.indexOf(hour) >= 0) {} else {
                    hours.push(hour);
                    employerTime.hours = hours;
                    employerTime.save();
                }
            }
        } else {
            employerTime = new EmployerTime();

            employerTime.user = userID;
            employerTime.date = date;
            employerTime.hours = [hour];

            await employerTime.save();
        }
    }
}

async function updateEmployeeLocationAndTime(userID, data) {
    const d = moment(new Date());
    if (userID) {
        const date = d.format('YYYY-MM-DD');
        const hour = d.hours();

        let user = await User.findById(userID);

        user.location = {
            lat: data.lat,
            long: data.long
        }

        user.save();
        if (data.date == date) {
            let employeeTime = await EmployeeTime.findOne({ user: userID, date: date });

            if (employeeTime) {
                employeeTime.times = data.workTimeList;
                employeeTime.hours = getHourListFromWorkTime(data.workTimeList);

                employeeTime.save();
            } else {
                employeeTime = new EmployeeTime();

                employeeTime.user = userID;
                employeeTime.date = date;
                employeeTime.times = data.workTimeList;
                employeeTime.hours = getHourListFromWorkTime(data.workTimeList);

                await employeeTime.save();
            }
        }

        //Erase All
        let tasks = await Task.find({ user: userID, start_date: { $lte: date }, end_date: { $gte: date } });

        for (let task of tasks) {
            let taskTime = await TaskTime.findOne({ task: task.id, date: date });

            if (taskTime) {
                const hours = taskTime.hours;
                if (hours.length > 0) {
                    if (hours.indexOf(hour) >= 0) {} else {
                        hours.push(hour);
                        taskTime.hours = hours;
                        taskTime.save();
                    }
                }
            } else {
                taskTime = new TaskTime();

                taskTime.task = task.id;
                taskTime.date = date;
                taskTime.hours = [hour];

                await taskTime.save();
            }
        }
    }
}

function getHourListFromWorkTime(workTimeList) {
    let hourList = [];
    for (let workTime of workTimeList) {
        let startHour = moment(workTime.startTime).hour();
        let endHour = moment(workTime.endTime).hour();

        for (let i = startHour; i <= endHour; i++) {
            hourList.push(i);
        }
    }

    hourList = _.unique(hourList);
    hourList = _.sortBy(hourList);

    return hourList;
}


function getFirstDateOfWeek(d) {
    return d.subtract(d.day() == 0 ? 6 : d.day() - 1, 'days');
}