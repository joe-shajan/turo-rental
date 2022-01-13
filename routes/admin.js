const express = require('express');
const router = express.Router();
const adminHelpers = require('../helpers/admin-helpers')
const reportHelpers = require('../helpers/report-helpers');
const carsHelpers = require('../helpers/cars-helpers')
const userHelpers = require('../helpers/user-helpers')


function redirectToDashboard(req, res, next) {
  if (req.session.admin) {
    res.redirect('/admin')
  } else {
    next()
  }
}
function redirectToLogin(req, res, next) {
  if (!req.session.admin) {
    res.redirect('/admin/login')
  } else {
    next()
  }
}

/* admin dashboard. */
router.get('/',redirectToLogin,async function(req, res, next) {
  let salesReport = await reportHelpers.getSalesReportByCar();
  let carsCount = await carsHelpers.getCarsCount()
  let usersCount = await userHelpers.getUsersCount()
  let oneWeekRevenue = await reportHelpers.getOneWeekRevenue()
  res.render('admin/dashboard',{admin:true,loggedIn:true,sales:salesReport.sales,carsCount,usersCount,oneWeekRevenue})
  req.session.adminloggedIn = false

});



/* admin login. */
router.get('/login',redirectToDashboard, function(req, res, next) {
  res.render('admin/admin-login',{loginError:req.session.loginError,loginErrornovalue:req.session.loginErrornovalue ,Loginpage:true})
  req.session.loginError = false
  req.session.loginErrornovalue = false

});

/* admin login post. */
router.post('/login', function(req, res, next) {
  if(req.body.username ==""|| req.body.password == ""){
    req.session.loginErrornovalue = true
    res.redirect('/admin/login')
  }else{

    adminHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.adminloggedIn = true
        req.session.admin = response.admin
        res.redirect('/admin')
      } else {
        req.session.loginError = true
        res.redirect('/admin/login')
      }
    })
  }
});




//logout
router.get('/admin-logout', (req, res) => {
  req.session.admin = null
  res.redirect('/admin/login')
})




module.exports = router;
