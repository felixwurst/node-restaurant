// ---------------------------------------- setup ----------------------------------------
// express
const express = require('express');
// router
const adminRouter = express.Router();
// modules
const fs = require('fs'); // fileserver

// ---------------------------------------- routes ----------------------------------------

function useAdminRouter(myMeals) {

    // check if there is a valid session, all admin-routes have to pass this middleware 
    adminRouter.use((req, res, next) => {
        if (req.session.user) {
            next();
        } else {
            res.redirect('/');
        }
    })

    // admin-panel -> links to add, delete & edit meal
    adminRouter.get('/', (req, res) => {
        res.render('./admin');
    });

    // add meal
    adminRouter.get('/addmeal', (req, res) => {
        res.render('./adminAddMeal', {meals: myMeals});
    });
    adminRouter.post('/addmeal', (req, res) => {
        // inputs
        const mealTitle = req.body.mealTitle;
        const mealDescription = req.body.mealDescription;
        const mealPrice = req.body.mealPrice;
        const mealDetails = req.body.mealDetails;
        // if all inputs are filled out
        if (mealTitle && mealDescription && mealPrice && req.files) {
            const mealExist = myMeals.find(meal => meal.title == mealTitle); 
            // if meal title still exists 
            if (mealExist) {
                console.log("meal title still exists");
                res.send("meal title still exists");    
            // if meal title is a new one
            } else {
                const mealImg = req.files.mealImg;
                // cuts name of uploaded image, starting from last dot -> .png / .jpeg
                let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.')); 
                // replaces ' ' with '_', adds the number of myMeals.length and the extension
                mealImg.mv('./public/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext).then(() => { 
                    let obj = {
                        title: mealTitle,
                        price: mealPrice,
                        imgUrl: '/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext,
                        description: mealDescription,
                        details: mealDetails // tinyMCE-input
                    }
                    myMeals.push(obj);
                    fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
                    res.redirect('/admin/addmeal');
                }).catch(error => {
                    console.log(error);
                    res.send(error.message);
                })
            }
        // if the inputs are not filled out
        } else {
            res.send("meal data is not complete");    
        }
    });

    // delete meal
    adminRouter.get('/deletemeal', (req, res) => {
        res.render('./adminDeleteMeal', {meals: myMeals});
    });
    adminRouter.post('/deletemeal', (req, res) => {
        const idx = req.body.mealid;
        // deletes image from storage with unlink
        fs.unlink('./public' + myMeals[idx].imgUrl, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            console.log('Image deleted!');
        });
        // deletes image from storage with unlinkSync & try/catch
        // try {
        //     fs.unlinkSync('./public' + myMeals[idx].imgUrl);
        // } catch (error) {
        //     console.log('error');
        // }
        myMeals.splice(idx, 1);
        fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
        res.sendStatus(200);
    });

    // edit meal
    adminRouter.get('/editmeal', (req, res) => {
        res.render('./adminEditMeal', {meals: myMeals});
    });
    adminRouter.post('/editmeal', (req, res) => {
        // input-data
        myMeals[req.body.mealid].title = req.body.mealTitle;
        myMeals[req.body.mealid].description = req.body.mealDescription;
        myMeals[req.body.mealid].price = req.body.mealPrice;
        // updates meal with new image
        if (req.files) {
            const mealImg = req.files.mealImg;
            const mealTitle = req.body.mealTitle;
            // deletes old image from storage
            fs.unlinkSync('./public' + myMeals[req.body.mealid].imgUrl);
            // saves & renames new image
            let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.')); 
            mealImg.mv('./public/uploadedFiles/' + mealTitle.replace(/ /g, '_') + req.body.mealid + ext).then(() => {
                myMeals[req.body.mealid].imgUrl = '/uploadedFiles/' + mealTitle.replace(/ /g, '_') + req.body.mealid + ext;
                fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
                res.json(myMeals[req.body.mealid].imgUrl);
            }).catch(error => {
                res.sendStatus(500);
            })
        // updates meal without new image
        } else {
            fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
            res.json(myMeals[req.body.mealid].imgUrl);
        }
    });

    // checkmealname
    adminRouter.post('/checkmealname', (req, res) => {
        // console.log(req.body);
        const mealExist = myMeals.find(meal => meal.title == req.body.mealTitle);
        if (mealExist) {
            res.json("meal title exist");
        } else {
            res.json("meal title do not exist");
        }
    });
    
    return adminRouter;
}

// ---------------------------------------- export module ----------------------------------------

module.exports = { useAdminRouter }; // export function inside an object