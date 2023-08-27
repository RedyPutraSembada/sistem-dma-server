const User = require('../models/userModel');
const mongoose = require('mongoose');
const { ObjectId } = require('bson');
const bcrypt = require('bcrypt')


const createUser = async (req, res, next) => {
    try {
        const payload = req.body;

        let user = await User.create(payload);

        return res.json(user);
    } catch (err) {
        //* Kemungkinan eror karena Validasi
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        //* Error lainnya
        next(err);
    }
}

const index = async (req, res, next) => {
    try {
        let users = await User.find();
        return res.json({ data: users });
    } catch (err) {
        //* Kemungkinan eror karena Validasi
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }
    }
}

const updateUser = async (req, res, next) => {
    try {
        const id = new ObjectId(req.params);
        const payload = req.body;
        let user;
        if (payload.password === 'null') {
            console.log('update tanpa pw');
            user = await User.updateOne({ _id: id }, { full_name: payload.full_name, email: payload.email, role: payload.role });
        } else {
            console.log('update dengan pw');
            user = await User.findByIdAndUpdate(id, { ...payload, password: bcrypt.hashSync(payload.password, 10) });
        }
        return res.json(user);
    } catch (err) {
        //* Kemungkinan eror karena Validasi
        if (err && err.name === "ValidationError") {
            return res.json({
                error: 1,
                message: err.message,
                fields: err.errors
            });
        }

        //* Error lainnya
        next(err);
    }
}

module.exports = {
    createUser,
    index,
    updateUser,
}