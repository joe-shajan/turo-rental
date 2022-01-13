const express = require('express');
const reportHelpers = require('../helpers/report-helpers');
const router = express.Router();


function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
        res.redirect('/admin/login')
    } else {
        next()
    }
}


router.get('/trip-report',redirectToLogin, async (req, res, next) => {

    let completedTrips = await reportHelpers.getTripReports()
    res.render('admin/report/trip-report', { admin: true, completedTrips })
})

router.get('/trip-report-by-date',redirectToLogin, async (req, res, next) => {
    
    let completedTrips = await reportHelpers.getTripReportsByDate(req.query)
    res.render('admin/report/trip-report', { admin: true, completedTrips: completedTrips.bookings, search: completedTrips.search })

})

router.get('/sales-report',redirectToLogin, async (req, res, next) => {

    let salesReport = await reportHelpers.getSalesReportByCar()
    res.render('admin/report/sales-report', { admin: true, salesReport: salesReport.bookings, sales: salesReport.sales })
})
router.get('/sales-report-by-city', async (req, res, next) => {

    let salesReport = await reportHelpers.getSalesReportByCity()
    res.render('admin/report/sales-report-by-city', { admin: true, salesReport: salesReport.bookings, sales: salesReport.sales })
})


router.get('/sales-report-by-date',redirectToLogin, async (req, res, next) => {

    let salesReport = await reportHelpers.getSalesReportByCarSearch(req.query)
    res.render('admin/report/sales-report', { admin: true, salesReport: salesReport.bookings, sales: salesReport.sales, search: salesReport.search })
})

router.get('/sales-report-city-by-date',redirectToLogin, async (req, res, next) => {

    let salesReport = await reportHelpers.getSalesReportByCitySearch(req.query)
    res.render('admin/report/sales-report-by-city', { admin: true, salesReport: salesReport.bookings, sales: salesReport.sales, search: salesReport.search })
})


router.get('/get-top-five-trip-completed-brand', async (req, res) => {
    let data = await reportHelpers.getTopFiveTripCompletedBrand()
   
    res.json({
        percentage: data.percentages,
        brand: data.brand
    })
})
router.get('/get-top-five-trip-completed-city', async (req, res) => {
    let data = await reportHelpers.getTopFiveTripCompletedCity()
    
    res.json({
        percentage: data.percentages,
        city: data.city
    })
})
router.get('/get-top-five-trip-booked-brand', async (req, res) => {
    let data = await reportHelpers.getTopFiveTripBookedByBrand()
    
    res.json({
        percentage: data.percentages,
        brand: data.brand
    })
})
router.get('/get-top-five-trip-booked-city', async (req, res) => {
    let data = await reportHelpers.getTopFiveTripBookedByCity()
   
    res.json({
        percentage: data.percentages,
        city: data.city
    })
})

router.get('/get-day-wise-booking-for-one-week', async (req, res)=>{
  let data = await  reportHelpers.getDayWiseBookingForOneWeek()
  res.json(data)
})
router.get('/get-day-wise-sales-for-one-week', async (req, res)=>{
  let data = await  reportHelpers.getSalesForOneWeek()
  res.json(data)
})





module.exports = router