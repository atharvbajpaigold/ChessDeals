const mongoose = require('mongoose');

mongoose.connect("mongodb+srv://Atharv:<db_password>@cluster0.qogq4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

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

