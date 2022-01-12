var express = require('express');
var router = express.Router();
var carsHelpers = require('../helpers/cars-helpers')
var userHelpers = require('../helpers/user-helpers')
var bannerHelpers = require('../helpers/banner-helpers')
var bookingHelpers = require('../helpers/booking-helpers')
var locationHelpers = require('../helpers/location-helpers')
var moment = require('moment');
var { ObjectId } = require('mongodb')
const prettyMilliseconds = require('pretty-ms');
require('dotenv').config()



const serviceSid = process.env.TWILLO_SERVICESID
const accountSid = process.env.TWILLO_ACCOUNTSID
const authToken = process.env.TWILLO_AUTH_TOKEN
const client = require('twilio')(accountSid, authToken)
const multer = require("multer");
const path = require('path');
const { LogPage } = require('twilio/lib/rest/serverless/v1/service/environment/log');

const Razorpay = require('razorpay');
const couponHelpers = require('../helpers/coupon-helpers');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_KEY,
})

const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': process.env.PAYPAL_CLIENT_ID,
  'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/user-images");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage });
var uploadMultiple = upload.fields([{ name: 'profilepic', maxCount: 1 }, { name: 'licenceimg', maxCount: 1 }])

function redirectToHome(req, res, next) {
  if (req.session.user) {
    res.redirect('/')
  } else {
    next()
  }
}

function redirectToLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login')
  } else {
    next()
  }
}
async function userData(req, res, next) {
  if (req.session.user) {
    res.userData = await userHelpers.getUser(req.session.user._id)
  }
  next()
}
let userDetails = {}

function sendOTP(phoneno) {
  return new Promise((resolve, reject) => {

    client.verify.services(serviceSid).verifications.create({
      to: `+91${phoneno}`,
      channel: "sms"
    }).then((response) => {
      resolve(response)
    })
  })
}


function verifyOTP(phoneno, otp) {
  return new Promise((resolve, reject) => {
    client.verify.services(serviceSid).verificationChecks.create({
      to: `+91${phoneno}`,
      code: otp
    }).then((response) => {
      resolve(response)
    })
  })
}


function convertMilliseconds(x) {
  diffInMillis = (x.from - new Date)
  if (diffInMillis < 0) {

    diffInMillis = diffInMillis * -1
    diffInMillis = (4 * 3.6e+6) - diffInMillis

    x.timeToCancel = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })

  } else {
    x.timeToStart = prettyMilliseconds(diffInMillis, { verbose: true, compact: true })
  }
}













/* GET home page. */
router.get('/', async (req, res, next) => {
  let filename = await bannerHelpers.getBanner()
  let brands = await userHelpers.browseByBrand()
  let cities = await locationHelpers.getCity()
  let popularCars = await carsHelpers.getPopularCars()
  let userData
  if (req.session.user) {
    userData = await userHelpers.getUser(req.session.user._id)
  }
  res.render('users/user-home', { userData, user: req.session.user, brands, filename, cities, popularCars });

});
//view cars by brand
router.get('/view-cars-by-brand/:brand/', userData, async (req, res, next) => {
  let carsData = await carsHelpers.getCarsByBrand(req.params.brand)
  let cities = await locationHelpers.getCity()
  res.render('users/view-cars', { cities, carsData, userData: res.userData, user: req.session.user, brand: req.params.brand, city: false });


});
//view cars by city
router.get('/view-cars-by-city/:city', userData, async (req, res, next) => {

  let carsData = await carsHelpers.getCarsByCity(req.params.city)
  let cities = await locationHelpers.getCity()
  let brandNames = await carsHelpers.getAllBrands()
  res.render('users/view-cars', { brandNames, cities, userData: res.userData, carsData, user: req.session.user, cityName: req.params.city, city: true });


});

//view car details 
router.get('/view-car-details/:id', userData, async (req, res, next) => {
  req.session.totalAmt = null
  let carsData = await carsHelpers.getCarsDetails(req.params.id)
  let reviews = await carsHelpers.getAllReviews(req.params.id)

  res.render('users/view-car-details', { reviews, userData: res.userData, carsData, user: req.session.user, userNotVerified: req.session.userNotVerified });

  req.session.userNotVerified = false
  req.session.checkout = null

});


/* GET login page. */
router.get('/login', redirectToHome, function (req, res, next) {
  res.render('users/user-login', { usernotExists: req.session.usernotExists, loginError: req.session.loginError });
  req.session.usernotExists = false
  req.session.loginError = false
});

// login form submit
router.post('/login', function (req, res, next) {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      if (response.user.permission) {
        req.session.userloggedIn = true
        req.session.user = response.user
        if (req.session.checkout) {
          res.redirect('/view-car-details/' + req.session.checkout.carId)

        } else {
          res.redirect('/')
        }
      } else {
        req.session.blockedUser = true
        res.redirect('/login')
      }
    } else {
      req.session.loginError = true
      res.redirect('/login')
    }
  })
});

/* GET signup page. */
router.get('/signup', redirectToHome, function (req, res, next) {

  res.render('users/user-signup', { userExists: req.session.userExists });
  req.session.userExists = false
});

//render signup otp page
router.get('/signup/otp', redirectToHome, (req, res) => {
  res.render('users/signup-otp', { wrongotp: req.session.wrongotp })
  req.session.wrongotp = false
})

// signup form submit
router.post('/signup', function (req, res, next) {
  userDetails = req.body
  userHelpers.checkUser(userDetails).then((response) => {
    if (response) {
      req.session.userExists = true
      res.redirect('/signup')
    } else {
      sendOTP(userDetails.phoneno).then((response) => {
      })
      res.redirect('/signup/otp')
    }
  })

});

//submiting signup otp form
router.post('/signup/otp', (req, res) => {
  let { otp } = req.body
  otp = otp.join("")
  verifyOTP(userDetails.phoneno, otp).then((response) => {
    if (response.valid) {
      userHelpers.doSignup(userDetails).then((response) => {
        if (response.status) {
          req.session.userloggedIn = true
          req.session.user = response.user
          res.redirect('/')
        }
      })
    } else {
      req.session.wrongotp = true
      res.redirect('/signup/otp')
    }
  })
})

//signup otp resend
router.get('/signup/otp/resend', (req, res) => {
  sendOTP(userDetails.phoneno).then((response) => {
  })
  res.redirect('/signup/otp')
})






//render login otp page
router.get('/login/otp', redirectToHome, (req, res) => {
  res.render('users/login-otp', { wrongotp: req.session.wrongotp })
  req.session.wrongotp = false
})

//login form submit
router.post('/login-otp', (req, res) => {

  userHelpers.checkUser(req.body).then((response) => {
    if (response) {
      userDetails = req.body
      sendOTP(req.body.phoneno).then((response) => {
      })
      res.redirect('/login/otp')
    } else {
      req.session.usernotExists = true
      res.redirect('/login')
    }
  })
})


//submiting login otp form
router.post('/login/otp', (req, res) => {
  let { otp } = req.body
  otp = otp.join("")
  verifyOTP(userDetails.phoneno, otp).then((response) => {
    if (response.valid) {
      userHelpers.doOtpLogin(userDetails).then((response) => {
        if (response.status) {
          req.session.userloggedIn = true
          req.session.user = response.user
          res.redirect('/')
        }
      })
    } else {
      req.session.wrongotp = true
      res.redirect('/login/otp')
    }
  })
})

//login otp resend
router.get('/login/otp/resend', (req, res) => {
  sendOTP(userDetails.phoneno).then((response) => {
  })
  res.redirect('/login/otp')
})



router.get('/upcomming-trips/:id', userData, (req, res) => {
  bookingHelpers.upCommingBookings(req.params.id).then((bookingData) => {
    for (x of bookingData) {
      convertMilliseconds(x)
      x.from = moment(x.from).format('lll')
      x.to = moment(x.to).format('lll')
    }
    res.render('users/upcomming-trips', { userData: res.userData, user: req.session.user, bookingData, paymentSuccessful: req.session.paymentSuccessful })
    req.session.paymentSuccessful = false
  })
})

router.get('/cancel-trip/:id', (req, res) => {
  bookingHelpers.cancelBooking(req.params.id).then((response) => {
    res.json(response)
  })
})

router.get('/profile', async (req, res) => {
  let userData = await userHelpers.getUser(req.session.user._id)
  let walletBalance = await bookingHelpers.getTotalRefundAmount(req.session.user._id)
  res.render('users/profile', { walletBalance, user: req.session.user, userData })

})
router.get('/edit-profile', (req, res) => {
  userHelpers.getUser(req.session.user._id).then((userData) => {

    res.render('users/edit-profile', { user: req.session.user, userData })
  })
})

router.post('/update-profile', (req, res) => {
  uploadMultiple(req, res, (err) => {
    if (err) {
      console.log(err);
      return
    }

    if (req.files.profilepic) {
      req.body.profileImage = req.files.profilepic[0].filename
    }
    if (req.files.licenceimg) {
      req.body.licenceImage = req.files.licenceimg[0].filename
    }
    userHelpers.updateUser(req.body, req.session.user._id).then(() => {
      res.redirect('/profile')
    })

  })
})

router.get('/change-password', redirectToLogin, async (req, res) => {
  let userData
  if (req.session.user) {
    userData = await userHelpers.getUser(req.session.user._id)
  }
  res.render("users/change-password", { userData, user: req.session.user, wrongpassword: req.session.wrongpassword })
  req.session.wrongpassword = false
})

router.post('/change-password', (req, res) => {

  userHelpers.changePassword(req.body.currentpassword, req.body.newpassword, req.session.user._id).then((response) => {
    if (response.status) {

      res.redirect('/profile')
    } else {
      req.session.wrongpassword = true
      res.redirect('/change-password')
    }
  })
})

router.get('/logout', (req, res) => {
  req.session.user = null
  req.session.userloggedIn = false
  res.redirect('/')

})



let bookingDetails = {}
let bookingDate = {}

function calculateHours(body) {

  fromTime = body.from[1]
  fromDate = body.from[0]
  let from = fromDate + fromTime
  from = new Date(from)

  toDate = body.to[0]
  toTime = body.to[1]
  let to = toDate + toTime
  to = new Date(to)

  bookingDate.from = moment(from).format("lll");
  bookingDate.to = moment(to).format("lll");

  bookingDetails.from = from
  bookingDetails.to = to

  let hours = Math.abs(to - from) / 36e5
  return hours
}

function totalAmount(price, hours) {
  let pricePerHour = price / 24
  return pricePerHour * hours

}

router.get('/check-car-available/:carId/:from/:to', async (req, res) => {

  from = new Date(req.params.from)
  to = new Date(req.params.to)

  let response = await bookingHelpers.getBookedCars(req.params.carId, from, to)
  console.log(response);
  res.json(response)
})

router.get('/verify-user',userData,(req, res)=>{
  console.log(res.userData)
})

//checkout post
router.post('/checkout/:id', async (req, res) => {
  let userData
  if (req.session.user) {
    userData = await userHelpers.getUser(req.session.user._id)
  }
  let hours = calculateHours(req.body)
  if (req.session.user) {

    if (userData.verified) {

      let carData = await carsHelpers.getCarsDetails(req.params.id)


      totalAmt = totalAmount(carData.price_per_day, hours)
      bookingAmt = Math.round(totalAmt)

      bookingDetails.userId = ObjectId(req.session.user._id)
      bookingDetails.carId = ObjectId(carData._id)

      totalAmt = bookingAmt + 1000
      bookingDetails.totalAmount = totalAmt
      req.session.totalAmt = totalAmt
      checkoutDetails = {
        carId: req.params.id,
        userData: userData,
        carData: carData,
        bookingDate: bookingDate,
        totalAmt: totalAmt,
        bookingAmt: bookingAmt

      }
      req.session.checkoutDetails = checkoutDetails
      res.redirect('/checkout/')

    } else {
      req.session.userNotVerified = true
      res.redirect('/view-car-details/' + req.params.id)

    }
  } else {
    req.session.checkout = {
      carId: req.params.id
    }
    res.redirect('/login')
  }
})

router.get('/checkout/', (req, res) => {
  req.session.couponApplied = false
  res.render('users/checkout', {
    userData: req.session.checkoutDetails.userData,
    carData: req.session.checkoutDetails.carData,
    bookingDate: req.session.checkoutDetails.bookingDate,
    totalAmt: req.session.checkoutDetails.totalAmt,
    bookingAmt: req.session.checkoutDetails.bookingAmt,
    user: req.session.user
  })

})

router.get('/book', (req, res) => {
  let options = {
    amount: req.session.totalAmt * 100,
    currency: "INR",
  }
  razorpay.orders.create(options, (err, order) => {
    res.json(order)
  })
})

router.get('/apply-coupon/:coupon', async (req, res) => {
  let couponApplied = await userHelpers.CheckCouponApplied(req.session.user._id, req.params.coupon)
  if (!couponApplied) {

    let response = await couponHelpers.checkCoupon(req.params.coupon)
    if (response.ValidCoupon) {
      if (!req.session.couponApplied) {

        discountAmt = req.session.totalAmt * response.offerPercentage / 100
        req.session.totalAmt = req.session.totalAmt - discountAmt

        data = {
          response: true,
          newAmount: req.session.totalAmt
        }
        bookingDetails.totalAmount = req.session.totalAmt
        req.session.coupon = req.params.coupon
        req.session.couponApplied = true
      }

    } else {
      data = {
        response: false
      }
    }
  } else {
    data = { couponUsed: true }
  }
  res.json(data);

})


router.post('/is-order-complete', (req, res) => {
  let body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;

  var crypto = require("crypto");
  var expectedSignature = crypto.createHmac('sha256', 'JBvcyTFdq5gZtqjNkOxwOrgn')
    .update(body.toString())
    .digest('hex');

  var response = { "signatureIsValid": false }
  if (expectedSignature === req.body.razorpay_signature)
    response = { "signatureIsValid": true }
  if (response.signatureIsValid) {
    bookingDetails.orderId = req.body.razorpay_order_id
    bookingDetails.paymentId = req.body.razorpay_payment_id
    bookingHelpers.newBooking(bookingDetails, req.session.coupon).then(() => {
      bookingDetails = {}
      req.session.paymentSuccessful = true
      res.redirect('/upcomming-trips/' + req.session.user._id)
    })
  } else {
    console.log("payment failed");
  }
})

router.get('/add-to-wishlist/:carId', async (req, res) => {

  if (req.session.user) {
    let response = await userHelpers.addToWishlist(req.session.user._id, req.params.carId)
    res.json(response);
  } else {
    res.json({ noUser: true })
  }
})

router.get('/find-cars-inWishlist', async (req, res) => {

  if (req.session.user) {
    carIds = await userHelpers.getCarsInWishlist(req.session.user._id)
    res.json(carIds)
  }
})



router.get('/wishlist', userData, async (req, res) => {
  let carsData = await userHelpers.getCarDetailsInWishlist(req.session.user._id)
  res.render('users/wishlist', { carsData, userData: res.userData, user: req.session.user })
})


router.get('/booking-history', redirectToLogin, userData, async (req, res) => {
  let tripData = await bookingHelpers.getCompletedTripsByUser(req.session.user._id)

  for (i = 0; i < tripData.length; i++) {

    tripData[i].from = moment(tripData[i].from).format('lll')
    tripData[i].to = moment(tripData[i].to).format('lll')
  }
  res.render('users/booking-history', { tripData, userData: res.userData, user: req.session.user, reviewPosted: req.session.reviewPosted })
  req.session.reviewPosted = false
})

router.post('/submit-review', (req, res) => {
  carsHelpers.submitRating(req.body, req.session.user).then(() => {
    req.session.reviewPosted = true
    // res.redirect('/booking-history')
    res.json(true)
  })
})


router.get('/get-average-review', async (req, res) => {
  let carData = await carsHelpers.getCarsAverageReview()
  res.json(carData)
})

router.get('/cancelled-bookings', userData, async (req, res) => {
  let tripData = await bookingHelpers.getCancelledBookingByUser(req.session.user._id)
  for (x of tripData) {
    x.from = moment(x.from).format('lll')
    x.to = moment(x.to).format('lll')
  }
  res.render('users/cancelled-bookings', { tripData, userData: res.userData, user: req.session.user })
})

router.get('/search-location-date-time', async (req, res) => {

  req.query.from = new Date(req.query.from[0] + req.query.from[1])
  req.query.to = new Date(req.query.to[0] + req.query.to[1])


  let carsData = await carsHelpers.searchCars(req.query)
  let cities = await locationHelpers.getCity()
  let brandNames = await carsHelpers.getAllBrands()
  res.render('users/view-cars', { brandNames, cities, carsData, userData: res.userData, user: req.session.user, cityName: req.query.location, city: true });

})



router.get('/checkout-paypal', (req, res) => {

  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3001/success",
      "cancel_url": "http://localhost:3001/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Red Sox Hat",
          "sku": "001",
          "price": Math.trunc(req.session.totalAmt / 74),
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": Math.trunc(req.session.totalAmt / 74)
      },
      "description": "Hat for the best team ever"
    }]
  };

  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });

});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": Math.trunc(req.session.totalAmt / 74)
      }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      bookingHelpers.newBooking(bookingDetails, req.session.coupon).then(() => {
        bookingDetails = {}
        req.session.paymentSuccessful = true
        res.redirect('/upcomming-trips/' + req.session.user._id)
      })
    }
  });
});

router.get('/cancel', (req, res) => {
  res.redirect('/checkout/')
});





router.get('/sort/', userData, async (req, res) => {

  let carsData = await carsHelpers.sort(req.query)

  let cities = await locationHelpers.getCity()
  let brandNames = await carsHelpers.getAllBrands()

  res.render('users/view-cars', { brandNames, cities, carsData, userData: res.userData, user: req.session.user, brand: req.query.brand, cityName: req.query.city });
})


router.get('/filter', userData, async (req, res) => {

  req.query.fromyear = parseInt(req.query.fromyear)
  req.query.toyear = parseInt(req.query.toyear)
  req.query.seats = parseInt(req.query.seats)

  let carIds = await carsHelpers.filter(req.query)
  res.json(carIds)
})



module.exports = router;
