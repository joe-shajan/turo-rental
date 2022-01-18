const AWS = require('aws-sdk')

const BUCKET_NAME = "turorental"
const fs = require('fs')

const KEY_ID = "AKIA4GOV2GBXNHZRAUF3"
const SECRET_KEY = "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"

const s3 = new AWS.S3({
    accessKeyId: KEY_ID,
    secretAccessKey: SECRET_KEY
})


module.exports ={
    
    uploadFileToS3: async(filePath, file)=> {
        
        const buf = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""),  'base64')
        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath, // File name you want to save as in S3
            Body: buf,
            ContentEncoding: 'base64',
            ContentType: 'image/png',
            ACL: 'public-read'
    
        };
    
        // Uploading files to the bucket
        const response = await s3.upload(params).promise()
        return response.Location
    
    },
    uploadLicenceProfile: async(filePath)=> {
        
        const buf = fs.readFileSync(filePath)
        fs.unlinkSync(filePath);

        // Setting up S3 upload parameters
        const params = {
            Bucket: BUCKET_NAME,
            Key: filePath, // File name you want to save as in S3
            Body: buf,
            ContentType: 'image/png',
            ACL: 'public-read'
    
        };
    
        // Uploading files to the bucket
        const response = await s3.upload(params).promise()
        return response.Location
    
    }
}