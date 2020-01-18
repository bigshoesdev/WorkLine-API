'use strict';

require('rootpath')();

var DateData = require('app/models/date.model');
var User = require('app/models/user.model');


module.exports = {
    register,
};

async function register(d, userID) {
    if (!d.comments) {
        throw 'Incorrect date information.';
    }


    let dateData = new DateData(d);

    dateData.created_by = userID;
    await dateData.save();

    let createdUser = await User.findById(dateData.created_by);
    let user = await User.findById(dateData.user);

    if (user.device_token && global.firebaseAdmin) {
        var payload = {
            data: {
                'title': 'New date has been assigned to you.',
                'message': 'Hello, Employer ' + createdUser.name + ' created new date for you. The date is between ' + dateData.startDate + ' and ' + dateData.endDate
            },
            notification: {
                title: 'New date has been assigned to you',
                body: 'Hello, Employer ' + createdUser.name + ' created new date for you. The date is between ' + dateData.startDate + ' and ' + dateData.endDate
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