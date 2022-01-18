var express = require('express');
var router = express.Router();
var carsHelpers = require('../helpers/cars-helpers')
const path = require('path');
const fs = require('fs');
const uploadToS3 = require('../helpers/upload-to-s3');

function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
      res.redirect('/admin/login')
    } else {
      next()
    }
  }
/* GET add car page. */

router.get('/add-new-car/',redirectToLogin, function (req, res, next) {
    res.render("admin/add-new-car", { admin: true })
});

// view all cars
router.get('/view-all-cars/',redirectToLogin, function (req, res, next) {
    carsHelpers.getAllCars().then((cars) => {
        res.render("admin/view-all-cars", { admin: true, cars, carAdded: req.session.carAdded })
        req.session.carAdded = false;
    })
});

// get add models page to user 
router.get('/add-models/',redirectToLogin, function (req, res, next) {
    res.render("admin/add-models", { admin: true, invalidInput: req.session.invalidInput })
    req.session.invalidInput = false

});

// view all models
router.get('/view-brands/',redirectToLogin, function (req, res, next) {
    carsHelpers.getAllMakes().then((cars) => {
        res.render("admin/view-brands", { admin: true, cars })
    })
});

// view all brands
router.get('/view-models/:id',redirectToLogin, function (req, res, next) {

    carsHelpers.getAllModels(req.params.id).then((models) => {
        res.render("admin/view-models", { admin: true, models })
    })


});

//get brand image
router.get('/brand-image/:make', (req, res) => {
    carsHelpers.getBrandImage(req.params.make).then((response) => {
        res.json({
            url: response
        })
    })
})

// inserting brand and model into database 
router.post('/add-models/', function (req, res, next) {
    if (!req.body.make || !req.body.type || !req.body.model || !req.body.year) {
        req.session.invalidInput = true
        res.redirect('/cars-management/add-models')

    } else if (req.body.make == "" || req.body.type == "" || req.body.model == "" || req.body.year == "") {
        req.session.invalidInput = true
        res.redirect('/cars-management/add-models')
    } else {
        carsHelpers.addNewModel(req.body).then(() => {
            res.redirect('/cars-management/add-models')
        })
    }
});


//add new car
router.post('/add-new-car',async function (req, res, next) {
    let len = req.body.image.length
    let imageNames = []
    for (i = 0; i < len; i++) {
        let base64String = req.body.image[i]
        let filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'
        let location = await uploadToS3.uploadFileToS3(filename, base64String)
        if(location){
            imageNames.push(location)
        }
       
    }

    carsHelpers.addNewCar(req.body, imageNames).then((response) => {
        req.session.carAdded = true
        res.redirect('/cars-management/view-all-cars')
    })
})
//edit car
router.post('/edit-car/:carId', function (req, res, next) {
    let len = req.body.image.length
    let imageNames = []
    for (i = 0; i < len; i++) {

        if (req.body.image[i].length < 100) {
            imageNames.push(req.body.image[i])
        }

        if (req.body.image[i].length > 100) {

            let base64String = req.body.image[i]
            let base64Image = base64String.split(';base64,').pop();
            let filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'

            fs.writeFile(path.join(__dirname, '../public/images/car-images/' + filename), base64Image, { encoding: 'base64' }, function (err) {
            });
            Array.prototype.insert = function (index, item) {
                this.splice(index, 0, item);
            };
            imageNames.insert(i, filename)
        }
    }

    carsHelpers.updateCar(req.params.carId,req.body,imageNames).then((response)=>{
        req.session.carAdded = true
        res.redirect('/cars-management/view-all-cars')
    })
})

router.get('/delete-car/:id', (req, res) => {
    carsHelpers.deleteCar(req.params.id).then(() => {
        res.json(true);
    })
})
router.get('/delete-brand/:id', (req, res) => {
    carsHelpers.deleteBrand(req.params.id).then(() => {
        res.json(true);
    })
})
router.get('/delete-model/:brand/:model/:year', (req, res) => {
    carsHelpers.deleteModel(req.params.brand, req.params.model, req.params.year).then(() => {
        res.json(true);
    })


})

router.get('/get-all-brands', (req, res) => {
    carsHelpers.getAllBrands().then((makes) => {
        res.json(makes)
    })
})

router.get('/get-all-models/:make', (req, res) => {

    carsHelpers.getAllModelsByBrand(req.params.make).then((model) => {
        res.json(model)
    })
})

router.get('/get-all-types/:make/:model', (req, res) => {
    carsHelpers.getAllTypesByBrand(req.params.make, req.params.model).then((types) => {
        res.json(types)
    })
})
router.get('/get-year/:make/:model/:type', (req, res) => {
    console.log(req.params)
    carsHelpers.getYears(req.params.make, req.params.model, req.params.type).then((years) => {
        res.json(years)
    })
})
//distance calculator

router.get('/get-nearest-cars/:latitude/:longitude', async (req, res) => {


    let nearestCars = await carsHelpers.getNearestCars(req.params.latitude, req.params.longitude)
    let cars = false
    
    if(nearestCars[0]){
        cars = true
    }
    res.json({cars,nearestCars})
})

router.get('/edit-car/:carId', async (req, res) => {
    let carData = await carsHelpers.getCarsDetailsForEdit(req.params.carId)
    res.render('admin/edit-car', { admin: true, carData })
})

//distance calculator

module.exports = router;
