var express = require('express');
var router = express.Router();
var userHelpers = require('../helpers/user-helpers')

function redirectToLogin(req, res, next) {
    if (!req.session.admin) {
        res.redirect('/admin/login')
    } else {
        next()
    }
}

router.get('/all-users',redirectToLogin,(req,res)=>{
    userHelpers.getAllUsers().then((users)=>{
        res.render('admin/users/all-users',{admin:true,users})
    })
})

router.get('/blocked-users',redirectToLogin,(req,res)=>{
    res.render('admin/users/blocked-users',{admin:true})
})


router.get('/view-user-profile/:id',(req,res)=>{
    
    userHelpers.getUser(req.params.id).then((userData)=>{
        res.render('admin/users/view-user-profile',{admin:true,userData})
       
    })
})

router.get('/verify-user/:id',(req,res)=>{
    userHelpers.verifyUser(req.params.id).then(()=>{
        res.redirect('/user-management/view-user-profile/'+req.params.id)
    })
})

router.get('/block-user/:id',(req,res)=>{
    userHelpers.blockUser(req.params.id).then(()=>{
        res.json(true);
    })
})
router.get('/unblock-user/:id',(req,res)=>{
    userHelpers.unblockUser(req.params.id).then(()=>{
        res.redirect('/user-management/view-user-profile/'+req.params.id)
    })
})
module.exports = router