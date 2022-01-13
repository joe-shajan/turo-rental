var express = require('express');
var router = express.Router();
const locationHelpers = require('../helpers/location-helpers')
const path = require('path');
const fs = require('fs')


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



router.post('/add-city', (req, res) => {

    let base64String = req.body.image
    let base64Image = base64String.split(';base64,').pop();
    let filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'

    fs.writeFile(path.join(__dirname, '../public/images/location-images/' + filename), base64Image, { encoding: 'base64' }, function (err) {
    });
    locationHelpers.addCity(req.body, filename).then(() => {
        res.redirect('/location-management/add-location')
    })
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