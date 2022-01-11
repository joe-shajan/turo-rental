var db = require('../config/connection')
var collections = require('../config/collections')

module.exports = {
    addBanner: (fileName) => {
        file = {
            filename: fileName
        }
        let response = {}
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.BANNER).findOne()
            if (data) {
               db.get().collection(collections.BANNER).updateOne({},{$set:{filename:file.filename}}).then(()=>{
                   resolve()
               })
            } else {

                db.get().collection(collections.BANNER).insert(file).then(() => {
                    resolve()
                })
            }
        })
    },
    getBanner:()=>{
        return new Promise(async(resolve,reject)=>{
            let data = await db.get().collection(collections.BANNER).findOne()
            if(data){

                resolve(data.filename)
            }else{
                resolve()
            }
        })
    },
    deleteBanner:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BANNER).remove().then(()=>{
                resolve()
            })
        })
    }
}