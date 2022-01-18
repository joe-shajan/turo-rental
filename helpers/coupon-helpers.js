var db = require('../config/connection')
var collections = require('../config/collections')
var { ObjectId } = require('mongodb')


module.exports = {
    addCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            console.log(data);
            let coupon = await db.get().collection(collections.COUPON).findOne({ couponcode: data.couponCode })
            if (coupon) {
                resolve({ couponExists: true })
            } else {
                console.log('no coupon');
                db.get().collection(collections.COUPON).insertOne(data).then(() => {
                    db.get().collection(collections.COUPON).createIndex({ "exprdate": 1 }, { expireAfterSeconds: 0 }).then(() => {

                        resolve({ couponExists: false })
                    })
                })
            }
        })
    },
    getAllCoupons: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.COUPON).find().toArray()
            resolve(data);
        })
    },
    deleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.COUPON).deleteOne({ _id: ObjectId(id) }).then(() => {
                resolve()
            })
        })
    },
    checkCoupon: (data) => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collections.COUPON).findOne({ couponcode: data })
            if (coupon) {
                percentage = parseInt(coupon.percentage)
                resolve(
                    {
                        ValidCoupon: true,
                        couponName: data,
                        offerPercentage: percentage
                    });
            } else {
                resolve({ ValidCoupon: false })
            }
        })
    },
    addOffers: (data) => {
        return new Promise(async (resolve, reject) => {
            let brand = await db.get().collection(collections.OFFERS).findOne({ brand: data.brand })
            if (brand) {
                await db.get().collection(collections.OFFERS).updateOne({ brand: data.brand }, { $set: { percentage: data.percentage, exprdate: data.exprdate } })
                await db.get().collection(collections.OFFERS).createIndex({ "exprdate": 1 }, { expireAfterSeconds: 0 })

                resolve()

            } else {
                await db.get().collection(collections.OFFERS).insertOne(data)
                await db.get().collection(collections.OFFERS).createIndex({ "exprdate": 1 }, { expireAfterSeconds: 0 })

                resolve()

            }
        })
    },
    getAllOffers: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.OFFERS).find().toArray()
            resolve(data);
        })
    },
    deleteOffer: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.OFFERS).deleteOne({ _id: ObjectId(id) }).then(() => {
                resolve()
            })
        })
    },
}