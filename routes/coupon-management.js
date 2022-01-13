var express = require('express');
var router = express.Router();
var couponHelpers = require('../helpers/coupon-helpers')
var moment = require('moment')

function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
      res.redirect('/admin/login')
    } else {
      next()
    }
  }

router.get('/add-coupon',redirectToLogin,async(req,res)=>{
    let allCoupons = await couponHelpers.getAllCoupons()
    for(x of allCoupons){
        x.exprdate = moment(x.exprdate).format('ll')
    }
    res.render('admin/coupons-and-offers/add-coupon',{admin:true,allCoupons,coupnExists:req.session.coupnExists})
    req.session.coupnExists =false
})

router.post('/add-coupon',(req,res)=>{
    req.body.exprdate = new Date(req.body.exprdate)

    couponHelpers.addCoupon(req.body).then((response)=>{
        if(response.couponExists){
            req.session.coupnExists = true
            res.redirect('/coupon-management/add-coupon')
        }else{
            res.redirect('/coupon-management/add-coupon')
        }
    })
})

router.get('/delete-coupon/:id',async(req,res)=>{
    couponHelpers.deleteCoupon(req.params.id).then(()=>{
        res.json(true);
    })
    
})

router.get('/add-offers',redirectToLogin,async(req,res)=>{
    let allOffers = await couponHelpers.getAllOffers()
    for(x of allOffers){
        x.exprdate = moment(x.exprdate).format('ll')
    }
    res.render('admin/coupons-and-offers/add-offers',{admin:true,allOffers})
})

router.post('/add-offer',(req,res)=>{
    req.body.exprdate = new Date(req.body.exprdate)

    couponHelpers.addOffers(req.body).then(()=>{
        res.redirect('/coupon-management/add-offers')
    })
})

router.get('/delete-offer/:id',async(req,res)=>{
    couponHelpers.deleteOffer(req.params.id).then(()=>{
        res.json(true)
    })
    
})
module.exports = router