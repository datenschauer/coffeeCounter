const mongoose = require('mongoose');
// const Int32 = require('mongoose-int32');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    hashedPassword: {
        type: String,
        required: true,
    },
    passwordSalt: {
        type: String,
        required: true,
    },
    isAdmin: {
        type: Boolean,
        required: true,
    },
    lastLogin: Date,
    currentBalanceInCent: Number,
    drinks: [{
        date: {
            type: Date,
            required: true,
        },
        cups: {
            type: Number,
            required: true,
        },
        withMilk: {
            type: Boolean,
            required: true,
        },
        priceInCent: {
            type: Number,
            required: true,
        },
    }],
    cupsThisMonth: Number,
    payments: [{
        date: {
            type: Date,
            required: true,
        },
        // TO BE CONTINUED!
    }]
});

module.exports = mongoose.model('User', userSchema);

/*
const mongoDb = require('mongodb');
const getDb = require('../db/database').getDb;

module.exports = class User {
    constructor(firstname, lastname, email, hashedPW) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.hashedPassword = hashedPW;
    }

    save() {
        const db = getDb();
        return db.collection('users').insertOne(this);
    }

    static findById(userId) {
        const db = getDb();
        return db.collection('users').findOne({_id: mongoDb.ObjectId(userId)});
    }
}*/
