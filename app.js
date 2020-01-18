'use strict';

require('rootpath')();
require('dotenv').config();

var moment = require('moment');
var session = require('express-session');
var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var jwttoken = require('jsonwebtoken');
var cors = require('cors');
var errorHandler = require('app/helper/error-handler');
var jwt = require('app/helper/jwt');
var config = require('app/config/config');
var LocalStrategy = require('passport-local').Strategy;
var User = require('app/models/user.model');
var Reminder = require('app/models/reminder.model');

var app = express();

var firebaseAdmin = require("firebase-admin");

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(require("app/config/firebase.json")),
    databaseURL: "https://workline-56102.firebaseio.com"
});

global.firebaseAdmin = firebaseAdmin;

var port = process.env.PORT || 4000;

var userService = require('app/user/user.service');

mongoose.connect(config.db);
console.log("------------- Database connected successfully ----------------" + config.db);

app.use(cors());
app.use(jwt());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(express.static(__dirname + '/asset'));
app.use(session({ secret: 'session secret', cookie: {}, resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

passport.serializeUser((u, done) => { done(null, u._id); });

passport.deserializeUser((id, done) => {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('signin', new LocalStrategy({ usernameField: 'name', passwordField: 'code', passReqToCallback: true }, userService.signin));
passport.use('signup', new LocalStrategy({ usernameField: 'name', passwordField: 'code', passReqToCallback: true }, userService.signup));

app.post('/api/user/signin', (req, res, next) => {
    passport.authenticate('signin', (err, user, info) => {
        if (err) { return next(err); }
        if (user) {
            let { code, ...userWithoutCode } = user.toObject();
            let token = jwttoken.sign({ userID: user._id }, config.secret);
            res.json({ success: true, user: userWithoutCode, token: token });
        } else {
            res.json({ success: false, message: info.message });
        }
    })(req, res, next);
});

app.post('/api/user/signup', (req, res, next) => {
    passport.authenticate('signup', (err, user, info) => {
        if (err) { return next(err); }
        if (user) {
            res.json({ success: true, user: user });
        } else {
            res.json({ success: false, message: info.message });
        }
    })(req, res, next);
});

app.get('/api/user/signout', (req, res) => {
    req.logout();
    res.json({ success: true })
});

app.use('/api/user', require('app/user/user.controller'));
app.use('/api/reminder', require('app/reminder/reminder.controller'));
app.use('/api/date', require('app/date/date.controller'));
app.use('/api/task', require('app/task/task.controller'));
app.use('/api/time', require('app/time/time.controller'));
app.use('/api/department', require('app/department/department.controller'));

app.use(errorHandler);

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);


var appServer = server.listen(port, '0.0.0.0', () => {
    var host = appServer.address().address;
    var port = appServer.address().port;

    console.log('\nApp listening at http://%s:%s\n', host, port);
});


async function sendReminderNotification() {
    let startDate = moment(new Date()).format('YYYY-MM-DD HH:mm');
    let endDate = moment(new Date()).add(10, "minute").format('YYYY-MM-DD HH:mm');

    let reminders = await Reminder.find({ date: { $gte: startDate, $lte: endDate } });

    for (let reminder of reminders) {
        if (reminder.alert) {
            console.log(reminder);
            let user = await User.findById(reminder.user);

            if (user) {
                if (user.device_token && global.firebaseAdmin) {
                    var payload = {
                        data: {
                            'title': 'Reminder Service: ' + reminder.title,
                            'message': reminder.description
                        },
                        notification: {
                            title: 'Reminder Service: ' + reminder.title,
                            body: reminder.description
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
        }
    }
}

setInterval(async function() {
    await sendReminderNotification();
}, 600000);