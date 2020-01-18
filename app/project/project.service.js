'use strict';

require('rootpath')();

var bcrypt = require('bcrypt');
var Project = require('app/project/project.model');

module.exports = {
    register,
    getAll,
    update
};


async function register(p) {
    // validate
    if (!p.title || !p.expiration || p.attendent.length == 0) {
        throw 'Incorrect project information.';
    }

    let project = new Project(p);
    await project.save();
}

async function getAll(searchKey) {
    if (searchKey == "")
        return await Project.find().sort({ "created_on": -1 }).populate({ path: 'created_by', select: 'name' }).populate({ path: 'attendent', select: 'name' });
    return await Project.find({ title: new RegExp("(/s)*(" + searchKey + ")(/s)*", 'i') }).sort({ "created_on": -1 }).populate({ path: 'created_by', select: 'name' }).populate({ path: 'attendent', select: 'name' });
}


async function update(id, projectParam) {
    let p = await Project.findById(id);

    if (!p) throw 'Project not found.';

    p.updated_on = Date.now;

    Object.assign(p, projectParam);

    await p.save();
}

