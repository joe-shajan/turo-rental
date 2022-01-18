var db = require('../config/connection')
var collections = require('../config/collections')
var { ObjectId } = require('mongodb')


module.exports = {
    newBooking: (data, coupon) => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collections.NEW_BOOKINGS).insertOne(data)
            if (coupon) {

                await db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(data.userId) }, { $push: { coupon: coupon } })
            }

            resolve()
        })

    },
    getNewBookings: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.NEW_BOOKINGS).aggregate([
                {
                    $lookup: {
                        from: collections.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'users'
                    }

                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$users'
                },
                {
                    $unwind: '$cars'
                }
            ]).sort({from:1}).toArray()

            resolve(bookings);

        })
    },
    getBookedCars: (carId, from, to) => {
        return new Promise(async (resolve, reject) => {
            let bookingData = await db.get().collection(collections.NEW_BOOKINGS).find({
                carId: ObjectId(carId),
                $or:
                    [
                        { from: { $lte: from }, to: { $gte: from } },
                        { from: { $lte: to }, to: { $gte: to } },
                        { from: { $gte: from }, to: { $lte: to } }
                    ]
            }).toArray()
            if (bookingData[0]) {
                
                resolve(true)
            } else {
                console.log('true');
                resolve(false)
            }


        })
    },
    upCommingBookings: (id) => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.NEW_BOOKINGS).aggregate([
                {
                    $match: {
                        userId: ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },

                {
                    $unwind: '$cars'
                }
            ]).sort({from:1}).toArray()

            resolve(bookings);

        })
    },
    cancelBooking: (id) => {
        return new Promise(async (resolve, reject) => {

            let data = await db.get().collection(collections.NEW_BOOKINGS).findOne({ _id: ObjectId(id) })
            if (data) {


                let hours = Math.abs(data.from - new Date) / 36e5

                if (data.from < new Date) {
                    data.cancellationFee = data.totalAmount
                    data.refundAmount = data.totalAmount - data.cancellationFee
                } else {
                    if (hours < 24) {
                        data.cancellationFee = data.totalAmount
                        data.refundAmount = data.totalAmount - data.cancellationFee
                    } else if (hours < 24 * 3) {
                        data.cancellationFee = data.totalAmount / 2
                        data.refundAmount = data.totalAmount - data.cancellationFee
                    } else if (hours < 24 * 5) {
                        data.cancellationFee = data.totalAmount / 4
                        data.refundAmount = data.totalAmount - data.cancellationFee
                    } else {
                        data.cancellationFee = data.totalAmount / 10
                        data.refundAmount = data.totalAmount - data.cancellationFee
                    }
                }

                db.get().collection(collections.CANCELLED_BOOKINGS).insertOne(data).then((datas) => {
                   
                    db.get().collection(collections.NEW_BOOKINGS).deleteOne({ _id: ObjectId(id) }).then(() => {
                        resolve(true)
                    })
                })
            }
        })
    },
    startTrip: (id) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.NEW_BOOKINGS).findOne({ _id: ObjectId(id) })
            db.get().collection(collections.ON_GOING_TRIPS).insertOne(data).then(() => {
                
                db.get().collection(collections.NEW_BOOKINGS).deleteOne({ _id:ObjectId(id) }).then(() => {
                    resolve()
                })
            })

        })
    },
    endTrip: (id) => {

        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.ON_GOING_TRIPS).findOne({ _id: ObjectId(id) })
            db.get().collection(collections.COMPLETED_TRIPS).insertOne(data).then((datas) => {
                
                db.get().collection(collections.ON_GOING_TRIPS).deleteOne({ _id: ObjectId(id) }).then(() => {
                    resolve()
                })
            })

        })
    },
    onGoingTrips: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.ON_GOING_TRIPS).aggregate([
                {
                    $lookup: {
                        from: collections.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'users'
                    }

                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$users'
                },
                {
                    $unwind: '$cars'
                }
            ]).toArray()

            resolve(bookings);
        })
    },
    completedTrips: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $lookup: {
                        from: collections.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'users'
                    }

                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$users'
                },
                {
                    $unwind: '$cars'
                }
            ]).toArray()

            resolve(bookings);
        })
    },
    cancelledBooking: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.CANCELLED_BOOKINGS).aggregate([
                {
                    $lookup: {
                        from: collections.USER_COLLECTION,
                        localField: 'userId',
                        foreignField: '_id',
                        as: 'users'
                    }

                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$users'
                },
                {
                    $unwind: '$cars'
                }
            ]).sort({from:-1}).toArray()

            resolve(bookings);
        })
    },
    getCompletedTripsByUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let completedTrips = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $match:
                    {
                        userId: ObjectId(userId)
                    }
                },
                {
                    $lookup:
                    {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }
                },
                {
                    $unwind: '$cars'
                }

            ]).toArray()


            for (x of completedTrips) {
                let review = await db.get().collection(collections.REVIEWS).findOne({ carId: ObjectId(x.carId), "users.userId": ObjectId(userId) })
                if (review) {

                    x.reviewPosted = true
                } else {
                    x.reviewPosted = false
                }
            }
            resolve(completedTrips);

        })
    },
    getCancelledBookingByUser: (userId) => {
        return new Promise(async (resolve, reject) => {
            let carData = await db.get().collection(collections.CANCELLED_BOOKINGS).aggregate([
                {
                    $match: { userId: ObjectId(userId) }
                },
                {
                    $lookup:
                    {
                        from: collections.CARS_COLLECTION,
                        localField: 'carId',
                        foreignField: '_id',
                        as: 'cars'
                    }
                },
                {
                    $unwind: '$cars'
                }
            ]).sort({from:-1}).toArray()
            resolve(carData);
        })
    },
    getTotalRefundAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.CANCELLED_BOOKINGS).find({ userId: ObjectId(userId) }).toArray()

            let totalRefundAmount = 0
            for (x of data) {
                totalRefundAmount += x.refundAmount
            }
            resolve(totalRefundAmount);
        })
    },
    displayRefundAmount: (id) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.NEW_BOOKINGS).findOne({ _id: ObjectId(id) })
            let hours = Math.abs(data.from - new Date) / 36e5

            if (data.from < new Date) {
                data.cancellationFee = data.totalAmount
                data.refundAmount = data.totalAmount - data.cancellationFee
            } else {
                if (hours < 24) {
                    data.cancellationFee = data.totalAmount
                    data.refundAmount = data.totalAmount - data.cancellationFee
                } else if (hours < 24 * 3) {
                    data.cancellationFee = data.totalAmount / 2
                    data.refundAmount = data.totalAmount - data.cancellationFee
                } else if (hours < 24 * 5) {
                    data.cancellationFee = data.totalAmount / 4
                    data.refundAmount = data.totalAmount - data.cancellationFee
                } else {
                    data.cancellationFee = data.totalAmount / 10
                    data.refundAmount = data.totalAmount - data.cancellationFee
                }
            }

            resolve({
                cancellationFee: data.cancellationFee,
                refundAmount: data.refundAmount
            })
        })
    },
    autoMoveTocancel: () => {
        let date = new Date()
       
        return new Promise(async (resolve, reject) => {
            let bookingData = await db.get().collection(collections.NEW_BOOKINGS).aggregate([
                {
                    $match: { from: { $lte: date } }
                },
                {
                    $addFields:
                    {
                        "timeDiffer":
                        {
                            $subtract:
                                [
                                    date, "$from"
                                ]
                        }
                    }
                }
            ]).toArray()

            if (bookingData[0]) {

                for (x of bookingData) {
                    let diff = x.timeDiffer / 3.6e+6
                    if (diff > 4) {

                        x.cancellationFee = x.totalAmount
                        x.refundAmount = x.totalAmount - x.cancellationFee

                        await db.get().collection(collections.CANCELLED_BOOKINGS).insertOne(x)
                        await db.get().collection(collections.NEW_BOOKINGS).deleteOne({ _id: ObjectId(x._id) })
                    }
                }
                
                resolve()
            } else {
                
                resolve()
            }

           
        })
    }

}
