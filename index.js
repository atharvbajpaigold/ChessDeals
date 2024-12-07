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

function checkUserCookie(req, res, next) {
    if (req.cookies.userData) {
        next();
    } else {
        res.status(401).render('mainsignup');
    }
}

app.get('/', (req, res) => {
    res.render('main');
});

app.get('/home', (req, res) => {
    res.render('main');
});

app.get('/signup', (req, res) => {
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
        if (usercreated.platform==="chesscom"){res.render('successc');}else{res.render("successl")}
    } catch (error) {
        res.render("error");
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
            res.redirect('/loginmain');
        }
    } catch (error) {
        res.redirect('/loginmain');
    }
});

app.get("/whichweb", (req, res) => {
    res.render('whichweb');
});

app.get("/LichessAccounts", async (req, res) => {
    try {
        let users = await user.find();
        res.render("lichess", { users });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

app.get("/ChessAccounts", async (req, res) => {
    try {
        let users = await user.find();
        res.render("chess", { users });
    } catch (error) {
        res.status(500).send(error.message);
    }
});

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
        res.render('error');
    }
});

app.get("/signout", (req, res) => {
    res.clearCookie('userData');
    res.redirect('/');
});

app.get("/profile", (req, res) => {
    const userData = req.cookies.userData;
    if (userData) {
        res.send(`Welcome ${userData.mainname}, your email is ${userData.mainemail} and your password is ${userData.mainpassword}`);
    } else {
        res.send("No user data found.");
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/myposts', checkUserCookie, async (req, res) => {
    const userData = req.cookies.userData; // Getting logged-in user's info from cookie

    try {
        // Fetch posts created by the logged-in user (using userData.mainemail)
        const posts = await user.find({ mainemail: userData.mainemail });
        if (posts.length === 0) {
            res.render('hisposts', { posts:[], message: 'You have not made any posts yet.',...posts });
        } else {
            res.render('hisposts', { posts });
        }
    } catch (error) {
        res.status(500).send('Error fetching posts: ' + error.message);
    }
});
