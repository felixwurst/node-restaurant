// ---------------------------------------- setup ----------------------------------------
// express
const express = require ('express');
const app = express();

// modules
const fs = require('fs');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const emailSender = require('./modules/emailSender');
const adminRouter = require('./routes/adminRouter');

// app-use
app.use(express.urlencoded({extended: false}));
app.use(express.json()); // parses incoming requests with json payloads to an object
app.use(express.static('./public')); // public-folder
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(session({
    secret: 'burger',
    cookie: {},
    resave: true,
    saveUninitialized: true
}));
app.use(cookieParser());

// ejs-views
app.set('view engine', 'ejs');
app.set('views', './views');

// myMeals
const myMeals = JSON.parse(fs.readFileSync('./meals.json')); // read json and parse to object

// ---------------------------------------- routes ----------------------------------------
// home
app.get('/', (req, res) => {
    res.render('./main', {meals: myMeals});
});

// menu
app.get('/menu', (req, res) => {
    res.render('./menu', {meals: myMeals});
});

// contact
app.get('/contact', (req, res) => {
    res.render('./contact', {sent: 1});
});
app.post('/contact', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    if (name != "" && name.length < 100) {
        emailSender.sendEmail(name, email, subject, message, ok => {
            if (ok) {
                res.render('./contact', {sent: 2}); // email is sent -> success-modal
            } else {
                res.render('./contact', {sent: 3}); // email is not sent -> error-modal
            }
        });       
    }
});

// meals
app.get('/meal/:title', (req, res) => {
    // get meal using title
    const mealTitle = req.params.title; // e.g. Burger_Boys
    const foundMeal = myMeals.find(meal => meal.title.trim().replace(/ /g, '_') == mealTitle);
    // console.log(foundMeal);
    // console.log(req.params.title);
    if (foundMeal) {
        res.render('./meal', {
            mealTitle: foundMeal.title,
            mealPrice: foundMeal.price,
            mealImg: foundMeal.imgUrl,
            mealDescription: foundMeal.description,
            mealDetails: foundMeal.details
        });
    } else {
        res.send("404: Not found");
    }
    // // get meal using id -> '/meal/:id'
    // const idx = req.params.id; // e.g. 2
    // if (myMeals[idx]) {
    //     res.render('./meal', {
    //         mealTitle: myMeals[idx].title,
    //         mealDescription: myMeals[idx].description,
    //         mealImg: myMeals[idx].imgUrl,
    //         mealPrice: myMeals[idx].price
    //     });
    // } else {
    //     res.send("404 Not found");
    // }
});

// ---------------------------------------- login to admin-panel ----------------------------------------
// login
app.get('/login', (req, res) => {
    // console.log(req.cookies);
    if (req.cookies.burgerUser) { // { username: 'felix', password: '1234' }
        const users = JSON.parse(fs.readFileSync('./users.json'));
        const foundUser = users.find(user => user.username == req.cookies.burgerUser.username && user.password == req.cookies.burgerUser.password)    
        if (foundUser) {
            req.session.user = foundUser;
            res.redirect('/admin'); // cookie exists & user is found in users.json
        } else {
            res.render('./login'); // cookie exists, but user is not found
        }    
    } else {
        res.render('./login'); // no cookie is saved
    }
});
app.post('/login', (req, res) => {
    // console.log(req.session);
    const users = JSON.parse(fs.readFileSync('./users.json'));
    // solution with find -> returns the value of the first element in an array that pass a test
    const foundUser = users.find(user => user.username == req.body.username && user.password == req.body.password)    
    if (foundUser) {
        req.session.user = foundUser;
        res.cookie("burgerUser", foundUser);
        // res.cookie("burgerUser", foundUser, {maxAge: 60000, httpOnly: true}); // cookie will delete after 60s
        res.json("exist"); // -> login.ejs -> /admin
    } else {
        res.json("not exist"); // -> login.ejs -> alert
    }
    // solution with for-loop
    // let check = false;
    // for (let i = 0; i < users.length; i++) {
    //     if (req.body.username == users[i].username && req.body.password == users[i].password) {
    //         check = true;
    //         break;
    //     }
    // }
    // if (check) {
    //     res.json("existing");
    // } else {
    //     res.json("not existing");
    // }
});

// logout
app.get('/logout', (req, res) => {
    req.session.destroy(); // destroys session & logs out
    res.clearCookie('burgerUser'); // deletes cookie
    res.redirect('/'); 
});

// admin
app.use('/admin', adminRouter.useAdminRouter(myMeals));

// ---------------------------------------- localhost ----------------------------------------
app.listen(3000, () => {
    console.log('App listening on port 3000!');
});