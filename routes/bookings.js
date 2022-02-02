var express = require('express');
var router = express.Router();
const moment = require('moment');
const prettyMilliseconds = require('pretty-ms');

const bookingHelpers = require('../helpers/booking-helpers')

const cron = require("node-cron");

cron.schedule("*/5 * * * *", function () {
    bookingHelpers.autoMoveTocancel()
});

function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
      res.redirect('/admin/login')
    } else {
      next()
    }
  }

function convertMilliseconds(x) {
    diffInMillis = (x.from - new Date())
    if (diffInMillis < 0) {
        x.lessThanTwoHour = true
        diffInMillis = diffInMillis * -1
        diffInMillis = (4 * 3.6e+6) - diffInMillis

        x.timeToCancel = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })

    } else {
        if (diffInMillis < (1 * 3.6e+6)) {
            x.lessThanTwoHour = true
        }
        x.timeToStart = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })
    }
}

router.get('/new-bookings',redirectToLogin, (req, res) => {
    bookingHelpers.getNewBookings().then((bookings) => {
        for (x of bookings) {
            convertMilliseconds(x)
            x.from = moment(x.from).format('lll')
            x.to = moment(x.to).format('lll')
            x.totalAmount = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.totalAmount)


        }
        res.render('admin/bookings/new-bookings', { admin: true, bookings })
    })
})

router.get('/cancelled-bookings',redirectToLogin, (req, res) => {

    bookingHelpers.cancelledBooking().then((bookings) => {
        for (x of bookings) {


            x.from = moment(x.from).format('ll')
            x.to = moment(x.to).format('ll')
            x.totalAmount = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.totalAmount)
            x.cancellationFee = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.cancellationFee)
            x.refundAmount = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.refundAmount)


        }
        res.render('admin/bookings/cancled-bookings', { admin: true, bookings })
    })
})

router.get('/on-going-trips',redirectToLogin, (req, res) => {
    bookingHelpers.onGoingTrips().then((bookings) => {
        for (x of bookings) {
            diffInMillis = x.to - new Date

            if (diffInMillis < 0) {
                diffInMillis = diffInMillis * -1

                hours = diffInMillis / 3.6e+6

                if(hours > 1){
                    x.fine = hours * (x.totalAmount * 5 / 100)
                    x.fine = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(parseInt(x.fine))

                }
                x.extraTime = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })
            } else {
                x.timeToEnd = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })
            }

            x.from = moment(x.from).format('lll')
            x.to = moment(x.to).format('lll')
            x.totalAmount = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.totalAmount)

        }
        res.render('admin/bookings/on-going-trips', { admin: true, bookings })
    })
})

router.get('/completed-trips',redirectToLogin, (req, res) => {
    bookingHelpers.completedTrips().then((bookings) => {
        for (x of bookings) {
            x.from = moment(x.from).format('lll')
            x.to = moment(x.to).format('lll')
            x.totalAmount = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(x.totalAmount)

        }
        res.render('admin/bookings/completed-trips', { admin: true, bookings })
    })
})

router.get('/start-trip/:id', (req, res) => {
    bookingHelpers.startTrip(req.params.id).then(() => {
        res.redirect('/bookings/on-going-trips')
    })
})
router.get('/complete-trip/:id', (req, res) => {
    bookingHelpers.endTrip(req.params.id).then(() => {
        res.redirect('/bookings/completed-trips')
    })
})

router.get('/get-booking-details/:id', async (req, res) => {
    let data = await bookingHelpers.displayRefundAmount(req.params.id)
    res.json(data)
})

module.exports = router