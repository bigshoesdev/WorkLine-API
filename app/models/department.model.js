'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String, required: true, unique: true },
    production: { type: Object, default: { value: 0, target: 0 } },
    billing: { type: Object, default: { value: 0, target: 0 } },
    members: { type: Number, default: 0 },
    created_on: { type: Date, required: true, default: Date.now },
    updated_on: { type: Date, required: true, default: Date.now },
});

schema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('department', schema);