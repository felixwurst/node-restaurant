// ---------------------------------------- setup ----------------------------------------
// express
const express = require('express');
const adminRouter = express.Router();

// modules
const fs = require('fs'); // fileserver

// ---------------------------------------- routes ----------------------------------------

function useAdminRouter(myMeals) {

    // add meal
    adminRouter.get('/addmeal', (req, res) => {
        res.render('./adminAddMeal', {meals: myMeals});
    });
    adminRouter.post('/addmeal', (req, res) => {
        const mealTitle = req.body.mealTitle;
        const mealDescription = req.body.mealDescription;
        const mealPrice = req.body.mealPrice;
        // console.log(req.body);
        // console.log(req.files.mealImg);
        if (mealTitle && mealDescription && mealPrice && req.files) {
            const mealImg = req.files.mealImg;
            console.log(mealImg);
            // cuts the imagename, starts from the last dot -> .png / .jpeg
            let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.')); 
            // replaces ' ' with '_', adds the number of myMeals.length and the extension
            mealImg.mv('./public/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext).then(() => { 
                let obj = {
                    title: mealTitle,
                    description: mealDescription,
                    imgUrl: '/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext,
                    price: mealPrice
                }
                myMeals.push(obj);
                fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
                res.redirect('/admin/addmeal');
            }).catch(error => {
                console.log(error);
                res.send(error.message);
            })
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
        fs.unlink('./public' + myMeals[idx].imgUrl, function(err) {
            if (err) {
                return res.status(500).send(err);
            }
            console.log('Image deleted!');
        });
        myMeals.splice(idx, 1);
        fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
        res.sendStatus(200);
    });

    // edit meal
    adminRouter.get('/editmeal', (req, res) => {
        res.render('./adminEditMeal', {meals: myMeals});
    });
    adminRouter.post('/editmeal', (req, res) => {
        let btnIdx = req.body.editBtn.replace("save", "")
        // console.log(btnIdx);
        // console.log(req.body.mealTitle[btnIdx]);
        // console.log(req.body.mealDescription[btnIdx]);
        // console.log(req.body.mealPrice[btnIdx]);
        // console.log(req.files);

        // image upload
        if (req.files) {
            const mealImg = req.files.mealImg;
            const mealTitle = req.body.mealTitle[btnIdx];
            // console.log(mealImg);
            // console.log(mealTitle);

            // delete old image
            fs.unlink('./public' + myMeals[btnIdx].imgUrl, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
                console.log('Image deleted!');
            });
            // save and rename new image
            let ext = mealImg.name.substr(mealImg.name.lastIndexOf('.')); 
            mealImg.mv('./public/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext).then(() => {
                // save inputs to meals.json & redirect
                myMeals[btnIdx].imgUrl = '/uploadedFiles/' + mealTitle.replace(/ /g, '_') + myMeals.length + ext;
                myMeals[btnIdx].title = req.body.mealTitle[btnIdx];
                myMeals[btnIdx].description = req.body.mealDescription[btnIdx];
                myMeals[btnIdx].price = req.body.mealPrice[btnIdx];
                fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
                res.redirect('/admin/editmeal');
            }).catch(error => {
                console.log(error);
                res.send(error.message);
            })
        } else {
            // save inputs to meals.json & redirect
            myMeals[btnIdx].title = req.body.mealTitle[btnIdx];
            myMeals[btnIdx].description = req.body.mealDescription[btnIdx];
            myMeals[btnIdx].price = req.body.mealPrice[btnIdx];
            fs.writeFileSync('./meals.json', JSON.stringify(myMeals));
            res.redirect('/admin/editmeal');
        }
    });

    return adminRouter;
}

// ---------------------------------------- export module ----------------------------------------

module.exports = { useAdminRouter }; // export function inside an object