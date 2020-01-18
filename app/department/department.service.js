'use strict';

require('rootpath')();

var Department = require('app/models/department.model');
var User = require('app/models/user.model');
var Task = require('app/models/task.model');
var TaskTime = require('app/models/task-time.model');

module.exports = {
    register,
    getEmployeesByDeptID,
    getDepartInfo,
    getStatisticsInfoByID,
    updateProductionAndBilling
};

async function getEmployeesByDeptID(id) {
    return await User.find({ department: id, type: 0 });
}

async function getDepartInfo(id) {
    let department = await Department.findById(id);
    let employees = await User.find({ department: id, type: 0 }).select('name status');
    let tasks = await Task.find({ department: id }).select('title status');

    return {
        department: department,
        employees: employees,
        tasks: tasks
    }
}

async function register(dept) {
    if (!dept.title || !dept.description) {
        throw 'Incorrect department information.';
    }

    let department = new Department(dept);
    await department.save();
}

async function updateProductionAndBilling(dept) {
    let department = await Department.findById(dept.id);

    if (dept.type == 0) {
        department.production = {
            target: department.production.target,
            value: parseInt(dept.value)
        }
    } else {
        department.billing = {
            target: department.billing.target,
            value: parseInt(dept.value)
        }
    }

    if (dept.type == 0) {
        let employees = await User.find({ department: dept.id }).select('production');

        let employeeValue = Math.floor(department.production.value / employees.length);

        for (let employee of employees) {
            let e = await User.findById(employee.id);

            e.production = {
                target: employee.production.target,
                value: parseInt(employeeValue)
            }

            await e.save();
        }
    }

    await department.save();

    return {
        department: department
    }
}

async function getStatisticsInfoByID(id) {
    let department = await Department.findById(id);

    let employees = await User.find({ department: id }).select('name production');

    let tasks = await Task.find({ department: id }).select('id');
    let taskIDs = tasks.map((task) => { return task.id });
    let taskTimes = await TaskTime.find({ task: { $in: taskIDs } }).select('date hours');

    let total_day = 0;
    let total_hour = 0;

    for (let taskTime of taskTimes) {
        total_day++;
        total_hour += taskTime.hours.length;
    }

    // 0: Active 1: Inactive 2: Holiday 3: Off Work
    let activeEmp = await User.find({ department: id, status: 0 }).count()
    let offWorkEmp = await User.find({ department: id, status: 3 }).count();
    let vacEmp = await User.find({ department: id, status: 2 }).count();

    // 0: Active 1: Cancelled 2: Paused 3: Ended
    let endedTasks = await Task.find({ department: id, status: 3 }).count();
    let activeTasks = await Task.find({ department: id, status: 0 }).count();
    let pauseTasks = await Task.find({ department: id, status: 2 }).count();
    let cancelTasks = await Task.find({ department: id, status: 1 }).count();


    let employeeList = [];
    for (let employee of employees) {
        let tasks = await Task.find({ user: employee.id }).select('id');
        let taskIDs = tasks.map((task) => { return task.id });
        let taskTimes = await TaskTime.find({ task: { $in: taskIDs } }).select('hours');

        let total_hour = 0;

        for (let taskTime of taskTimes) {
            total_hour += taskTime.hours.length;
        }

        employeeList.push({
            hour: total_hour,
            name: employee.name,
            production: employee.production.value,
            hour_rate: 6.5,
            result: total_hour * 6.5
        })
    }

    return {
        production: department.production,
        billing: department.billing,
        members: {
            value: employees.length
        },
        general: {
            total_hour: {
                value: total_hour,
                max: 300
            },
            work_day: {
                value: total_day,
                max: 30
            },
            active_emp: {
                value: activeEmp,
                max: 30
            },
            off_work_emp: {
                value: offWorkEmp,
                max: 30
            },
            vacation_emp: {
                value: vacEmp,
                max: 30
            }
        },
        task: {
            ended: endedTasks,
            active: activeTasks,
            pause: pauseTasks,
            cancel: cancelTasks
        },
        employeeList: employeeList
    };
}