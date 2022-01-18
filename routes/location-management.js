var express = require('express');
var router = express.Router();
const locationHelpers = require('../helpers/location-helpers')
const path = require('path');
const fs = require('fs')
const uploadToS3 = require('../helpers/upload-to-s3');

function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
        res.redirect('/admin/login')
    } else {
        next()
    }
}


router.get('/add-location',redirectToLogin, (req, res) => {
    res.render('admin/location/add-location', { admin: true })
})

router.get('/get-state', (req, res) => {
    locationHelpers.getallState().then((states) => {
        res.json(states)
    })

})
router.get('/get-city/:state', (req, res) => {
    locationHelpers.getallCity(req.params.state).then((city) => {
        res.json(city)
    })

})



router.post('/add-city',async (req, res) => {

    let base64String = req.body.image
    let filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'
    let location = await uploadToS3.uploadFileToS3(filename, base64String)
    if(location){
        locationHelpers.addCity(req.body, location).then(() => {
            res.redirect('/location-management/add-location')
        })
    }
    
})

router.get('/view-states',redirectToLogin, async (req, res) => {
    let states = await locationHelpers.showState()
    res.render('admin/location/view-states', { admin: true, states })
})

router.get('/delete-state/:id', (req, res) => {
    locationHelpers.deleteState(req.params.id).then(() => {
        res.json(true)
    })
})


router.get('/view-cities/:id', async (req, res) => {
    let city = await locationHelpers.showCities(req.params.id)
    res.render('admin/location/view-cities', { admin: true, city })
})

router.get('/delete-city/:city/:state', async (req, res) => {
    locationHelpers.deleteCity(req.params.state, req.params.city).then(() => {
        res.json(true)
    })

})

router.get('/get-all-cities/', (req, res) => {
    locationHelpers.getCityNames().then((data) => {
        res.json(data)
    })
})


module.exports = router