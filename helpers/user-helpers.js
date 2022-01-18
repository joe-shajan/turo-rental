var db = require('../config/connection')
var collections = require('../config/collections')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
module.exports = {
    checkUser: (userData) => {
        return new Promise(async (resolve, reject) => {
            let exists = false
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ phoneno: userData.phoneno })
            if (user) {
                exists = true
            }
            resolve(exists)

        })
    },

    doSignup: (userData) => {
        userData.verified = false
        userData.permission = true
        return new Promise(async (resolve, reject) => {
            let response = {}
            userData.password = await bcrypt.hash(userData.password, 10)
            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((userData) => {
                
                response.user = userData
                response.status = true
                resolve(response)
            })
        })

    },
    doLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })
            if (user) {
                bcrypt.compare(userData.password, user.password).then((status) => {
                    if (status) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }
        })
    },
    doOtpLogin: (userData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ phoneno: userData.phoneno })
            if (user) {
                response.user = user
                response.status = true
                resolve(response)

            } else {
                resolve({ status: false })
            }
        })
    },
    browseByBrand: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collections.MODELS).find().toArray()
            resolve(brands);
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    getUser: (id) => {
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(id) })
            resolve(user);
        })
    },
    updateUser: (data, id) => {
        return new Promise((resolve, reject) => {
            console.log(data);
            if (data.profileImage && data.licenceImage) {
                db.get().collection(collections.USER_COLLECTION).updateOne(
                    { _id: ObjectId(id) },
                    {
                        $set: {
                            firstname: data.firstname,
                            lastname: data.lastname,
                            email: data.email,
                            phoneno: data.phoneno,
                            address: data.address,
                            licenceImage: data.licenceImage,
                            profileImage: data.profileImage,
                        }
                    })
                    .then(() => {
                        resolve()
                    })
            }
            if (!data.profileImage && data.licenceImage) {
                console.log("only licence Image");
                db.get().collection(collections.USER_COLLECTION).updateOne(
                    { _id: ObjectId(id) },
                    {
                        $set: {
                            firstname: data.firstname,
                            lastname: data.lastname,
                            email: data.email,
                            phoneno: data.phoneno,
                            address: data.address,
                            licenceImage: data.licenceImage,

                        }
                    })
                    .then(() => {
                        resolve()
                    })
            }
            if (data.profileImage && !data.licenceImage) {
                console.log("only profile Image");
                db.get().collection(collections.USER_COLLECTION).updateOne(
                    { _id: ObjectId(id) },
                    {
                        $set: {
                            firstname: data.firstname,
                            lastname: data.lastname,
                            email: data.email,
                            phoneno: data.phoneno,
                            address: data.address,
                            profileImage: data.profileImage,
                        }
                    })
                    .then(() => {
                        resolve()
                    })
            }
            if (!data.profileImage && !data.licenceImage) {
                console.log("no any images");
                db.get().collection(collections.USER_COLLECTION).updateOne(
                    { _id: ObjectId(id) },
                    {
                        $set: {
                            firstname: data.firstname,
                            lastname: data.lastname,
                            email: data.email,
                            phoneno: data.phoneno,
                            address: data.address,

                        }
                    })
                    .then(() => {
                        resolve()
                    })
            }
        })
    },
    changePassword: (currentpassword, newpassword, id) => {
        return new Promise(async (resolve, reject) => {
            console.log(currentpassword, newpassword, id);

            let user = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(id) })
            if (user) {
                bcrypt.compare(currentpassword, user.password).then(async (status) => {
                    if (status) {
                        newpassword = await bcrypt.hash(newpassword, 10)
                        db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { password: newpassword } }).then(() => {
                            resolve({ status: true })
                        })
                    } else {
                        resolve({ status: false })
                    }
                })
            } else {
                resolve({ status: false })
            }

        })
    },
    verifyUser: (id) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { verified: true } }).then(() => {
                resolve()
            })
        })
    },
    blockUser: (id) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { permission: false } }).then(() => {
                resolve()
            })
        })
    },
    unblockUser: (id) => {
        return new Promise(async (resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: { permission: true } }).then(() => {
                resolve()
            })
        })
    },
    addToWishlist: (userId, carId) => {
        console.log('in addto wishlist');
        return new Promise(async (resolve, reject) => {
            wishlist = {
                userId: ObjectId(userId),
                cars: [{
                    carId: ObjectId(carId),

                }]
            }
            let user = await db.get().collection(collections.WISHLIST).findOne({ userId: ObjectId(userId) })
            if (user) {
                let car = await db.get().collection(collections.WISHLIST).findOne({ userId: ObjectId(userId), 'cars.carId': ObjectId(carId) })
                if (car) {
                    db.get().collection(collections.WISHLIST).updateOne({ userId: ObjectId(userId) }, { $pull: { cars: { carId: ObjectId(carId) } } }).then(() => {
                        resolve({ removedFromWishlist: true })
                    })
                } else {
                    db.get().collection(collections.WISHLIST).updateOne({ userId: ObjectId(userId) }, { $push: { cars: wishlist.cars[0] } }).then(() => {
                        resolve({ addedToWishlist: true })
                    })
                }
            } else {
                db.get().collection(collections.WISHLIST).insertOne(wishlist).then(() => {
                    resolve({ addedToWishlist: true })
                })
            }
        })
    },
    getCarsInWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let carIds = []
            let userDoc = await db.get().collection(collections.WISHLIST).findOne({ userId: ObjectId(userId) })
            if (userDoc) {

                for (x of userDoc.cars) {
                    carIds.push(x.carId);
                }
                resolve(carIds)
            } else {
                resolve()
            }
        })
    },
    getCarDetailsInWishlist: (userId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.WISHLIST).aggregate([
                {
                    $match: { userId: ObjectId(userId) }
                },
                {
                    $unwind: "$cars"
                },
                {
                    $lookup:
                    {
                        from: collections.CARS_COLLECTION,
                        localField: 'cars.carId',
                        foreignField: '_id',
                        as: 'carsData'
                    }
                }

            ]).toArray()

            let carsData = []
            for (x of data) {
                carsData.push(x.carsData[0]);
            }
            resolve(carsData);
        })
    },
    CheckCouponApplied:(userId,coupon)=>{
        return new Promise(async(resolve, reject) =>{
            let response = await db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId),coupon:{$elemMatch:{$eq:coupon}}})
            if(response){
                resolve(true)
            }else{
                resolve(false)
            }
        })
    },
    getUsersCount:() => {
        return new Promise(async(resolve, reject)=>{
            let users = await db.get().collection(collections.USER_COLLECTION).find().toArray()
            resolve(users.length)
        })
    }
}