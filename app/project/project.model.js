'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    title: { type: String, required: true },
    exp_date: { type: Date, required: true, default: Date.now },
    attendent: [{ type: "String", ref: 'user' }],
    created_by: { type: "String", ref: 'user' },
    status: { type: Number, required: true, default: 0 },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('project', schema);