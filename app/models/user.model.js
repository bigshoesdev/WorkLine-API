'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    mobile: { type: String, required: true },
    type: { type: Number, required: true, default: 0 }, // 1: Employer 0: Employee
    status: { type: Number, required: true, default: 0 }, // 0: Active 1: Inactive 2: Holiday 3: Off Work
    production: { type: Object, default: { value: 0, target: 0 } },
    billing: { type: Object, default: { value: 0, target: 0 } },
    location: { type: Object, default: { lat: 0, long: 0 } },
    departments: [{ type: "String", ref: 'department' }],
    department: { type: String, ref: 'department' },
    position: { type: String, ref: 'position' },
    startTime: { type: Object, default: { hour: 11, min: 30 } },
    endTime: { type: Object, default: { hour: 19, min: 30 } },
    avatar: { type: String, default: '' },
    device_token: { type: String, default: '' },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('user', schema);