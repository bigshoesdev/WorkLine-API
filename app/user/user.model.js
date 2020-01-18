'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
    name: { type: String , required: true},
    email: { type: String , required: true, unique: true},
    password: { type: String, required: true},
    sex: { type: String, required: true, default: 'm'},
    birth: { type: Date, required: true, default: Date.now },
    created_on: { type: Date, required: true, default: Date.now},
    updated_on: { type: Date, required: true, default: Date.now},
});

schema.set('toJSON', { virtuals: true }); 

module.exports = mongoose.model('user', schema);