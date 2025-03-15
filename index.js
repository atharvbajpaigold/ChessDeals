
const express = require('express');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const user = require('./database/signup');
const mainuser = require("./database/signupmain");
mongoose.connect("mongodb://127.0.0.1:27017/ChessDeals");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.user = req.cookies.userData ? req.cookies.userData.mainname : null;
    next();
});

// Middleware to check if user is logged in
function checkUserCookie(req, res, next) {
    if (req.cookies.userData) {
        next();
    } else {
        res.status(401).render('error', { errorMessage: "Unauthorized access. Please sign up or log in." });
    }
}

// Home routes

app.get("/hometest",(req,res)=>{res.render("test")});
app.get('/', (req, res) => {
    res.render('main');
});

app.get('/home', checkUserCookie, async (req, res) => {
    const userData = req.cookies.userData;

    try {
        let userExists = await mainuser.findOne({ mainemail: userData.mainemail });
        if (userExists) {
            res.render('main');
        } else {
            res.clearCookie('userData');
            res.redirect('/loginmain');
        }
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while checking if the user exists in the database. Please try again later." });
    }
});

// Signup and login routes
app.get('/sellaccount', (req, res) => {
    res.render('signup');
});

app.get('/loginmain', (req, res) => {
    res.render('login');
});

app.post('/create', checkUserCookie, async (req, res) => {
    let { name, email, password, rating, price, mobile, platform } = req.body;
    const userData = req.cookies.userData;
    try {
        let usercreated = await user.create({
            name,
            email,
            password,
            rating,
            price,
            mobile,
            platform,
            mainemail: userData.mainemail
        });
        if (usercreated.platform === "chesscom") {
            res.render('successc');
        } else {
            res.render("successl");
        }
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while creating your post. This username or name may be taken. Please try again or use a different one." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let userlogin = await mainuser.findOne({ mainemail: email, mainpassword: password });
        if (userlogin) {
            res.cookie('userData', { mainname: userlogin.mainname, mainemail: userlogin.mainemail }, { maxAge: 900000, httpOnly: true });
            res.redirect('/home');
        } else {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
    } catch (error) {
        res.status(401).render('error', { errorMessage: error.message });
    }
});

// Account deletion
app.post('/deleteAccount', checkUserCookie, async (req, res) => {
    const userData = req.cookies.userData;

    try {
        await mainuser.findOneAndDelete({ mainemail: userData.mainemail });
        await user.deleteMany({ mainemail: userData.mainemail });
        res.clearCookie('userData');
        res.redirect('/');
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while deleting your account. Please try again." });
    }
});

// Profile route
app.get('/profile', (req, res) => {
    const userData = req.cookies.userData;
    if (userData) {
        res.send(`Welcome ${userData.mainname}, your email is ${userData.mainemail}`);
    } else {
        res.send("No user data found.");
    }
});

// Show all Lichess accounts
app.get("/LichessAccounts", async (req, res) => {
    try {
        let users = await user.find();
        res.render("lichess", { users });
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while fetching Lichess accounts. Please try again." });
    }
});

// Show all Chess.com accounts
app.get("/ChessAccounts", async (req, res) => {
    try {
        let users = await user.find();
        res.render("chess", { users });
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while fetching Chess.com accounts. Please try again." });
    }
});

// Main signup route
app.get("/signupmain", (req, res) => {
    res.render("mainsignup");
});

app.post("/signupmain", async (req, res) => {
    let { mainname, mainemail, mainpassword } = req.body;
    try {
        let usercreated = await mainuser.create({
            mainname,
            mainemail,
            mainpassword
        });
        res.cookie('userData', { mainname, mainemail }, { maxAge: 900000, httpOnly: true });
        res.redirect("/home");
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while creating your main account. Please try again." });
    }
});

// Logout route
app.get("/signout", (req, res) => {
    res.clearCookie('userData');
    res.redirect('/');
});

// User's posts
app.get('/myposts', checkUserCookie, async (req, res) => {
    const userData = req.cookies.userData;

    try {
        const posts = await user.find({ mainemail: userData.mainemail });
        if (posts.length === 0) {
            res.render('hisposts', { posts: [], message: 'You have not made any posts yet.' });
        } else {
            res.render('hisposts', { posts });
        }
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while fetching your posts. Please try again." });
    }
});

// Delete post
app.post('/deletePost', async (req, res) => {
    const { postId } = req.body;
    try {
        await user.findByIdAndDelete(postId);
        res.redirect('/myposts');
    } catch (error) {
        res.status(500).render('error', { errorMessage: "An error occurred while deleting the post. Please try again." });
    }
});

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { errorMessage: "An unexpected error occurred. Please try again later." });
});

app.get("/whichweb",(req,res)=>{
    res.render("whichweb")
})

app.get("/test",(req,res)=>{res.render("test")})
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

