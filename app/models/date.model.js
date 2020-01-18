'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    comments: { type: String, required: true },
    reason: { type: Number, required: true }, /// 0:holiday
    startDate: { type: String, required: true }, /// 2019-03-19
    endDate: { type: String, required: true }, /// 2019-03-19
    pending: { type: Boolean, required: true },
    user: { type: String },
    created_by: { type: String, ref: 'user' },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('date', schema);