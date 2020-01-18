'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    date: { type: String, required: true },                     /// 2019-03-19
    hours: { type: Array, default: [] },
    user: { type: String, ref: 'user' },
    times: { type: Array, default: [] },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('employee-time', schema);