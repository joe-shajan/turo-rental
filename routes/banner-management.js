const express = require('express');
const router = express.Router();
const bannerHelpers = require('../helpers/banner-helpers')
const formidable = require('formidable');
const uploadToS3 = require('../helpers/upload-to-s3');

router.get('/banner', (req, res) => {
    bannerHelpers.getBanner().then((filename) => {
        res.render("admin/banner/banner", { admin: true, filename })
    })
})
router.post('/add-banner', (req, res) => {
    const form = formidable({ multiples: true });

    form.parse(req,async (err, fields, files) => {
        if (err) {
            res.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
            res.end(String(err));
            return;
        }
        let base64String = fields.image
        let filename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.png'

      let location = await uploadToS3.uploadFileToS3(filename, base64String)
      if(location){
          bannerHelpers.addBanner(location)
      }
    });
    res.json(true);
});



router.get('/delete-banner', (req, res) => {
    bannerHelpers.deleteBanner().then(() => {

        res.redirect('/banner-management/banner')
    })
})


module.exports = router