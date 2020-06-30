// ---------------------------------------- setup ----------------------------------------
// express
const express = require ('express');
const app = express();

// modules
const fs = require('fs');
const emailSender = require('./modules/emailSender');
const fileUpload = require('express-fileupload');
const adminRouter = require('./routes/adminRouter');

// app-use
app.use(express.urlencoded({extended: false})); // urlencoded aka bodyParser
app.use(express.static('./public')); // public-folder
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

// ejs-views
app.set('view engine', 'ejs');
app.set('views', './views');

// myMeals
const myMeals = JSON.parse(fs.readFileSync('./meals.json')); // read json and parse to object

// ---------------------------------------- routes ----------------------------------------
// admin
app.use('/admin', adminRouter.useAdminRouter(myMeals));

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
    // console.log(req.body);
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

// ---------------------------------------- localhost ----------------------------------------
app.listen(3000, () => {
    console.log('App listening on port 3000!');
});