const mongoose = require('mongoose');

const mainUserSchema = new mongoose.Schema({
    mainname: { type: String, required: true, unique: true },
    mainemail: { type: String, required: true, unique: true },
    mainpassword: { type: String, required: true }
});

const MainUser = mongoose.model('MainUser', mainUserSchema);

module.exports = MainUser;
