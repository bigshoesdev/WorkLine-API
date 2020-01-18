'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    start_date: { type: String, required: true },                     /// 2019-03-19
    end_date: { type: String, required: true },                     /// 2019-03-19
    alert: { type: Boolean, required: true },
    department: { type: String, ref: 'department' },
    user: { type: String, ref: 'user' },
    created_by: { type: String, ref: 'user' },
    status: { type: Number, required: true, default: 0 },               // 0: Active 1: Cancelled 2: Paused 3: Ended
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('task', schema);