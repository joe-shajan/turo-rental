var express = require('express');
var router = express.Router();
var bannerHelpers = require('../helpers/banner-helpers')
const formidable = require('formidable');
const fs = require('fs')
const path = require('path');



router.get('/banner',(req,res)=>{
    bannerHelpers.getBanner().then((filename)=>{
        res.render("admin/banner/banner",{admin:true,filename})
    })
})

router.post('/add-banner',(req,res)=>{
    const form = formidable({ multiples: true });
    
    form.parse(req, (err, fields, files) => {
        if (err) {
          res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
          res.end(String(err));
          return;
        }
        let base64String = fields.image
        let base64Image = base64String.split(';base64,').pop();
        let filename = Date.now()+'-'+ Math.round(Math.random()*1E9)+'.png'
        
        fs.writeFile(path.join(__dirname, '../public/images/banner-images/'+filename), base64Image, {encoding: 'base64'}, function(err) {
            bannerHelpers.addBanner(filename)
        }); 
    });
    res.json(true);
});
router.get('/delete-banner',(req,res)=>{
bannerHelpers.deleteBanner().then(()=>{

    res.redirect('/banner-management/banner')
})
})

router.get('/cropsample',(req,res)=>{
    res.render('admin/banner/cropsample')
})

module.exports = router