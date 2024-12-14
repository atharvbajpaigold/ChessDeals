const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ChessDeals");

const userSchema = new mongoose.Schema({
    name:String,
    email:{ type: String, required: true, unique: true },
    password: String,
    rating: Number,
    price: Number,
    mobile:Number,
    platform: String,
    mainusername:String,
    mainuserpassword:String,
    mainemail:String
});

const User = mongoose.model('signup', userSchema);

module.exports = User;

