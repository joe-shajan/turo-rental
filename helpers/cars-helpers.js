var db = require('../config/connection')
var collections = require('../config/collections')
var { ObjectId } = require('mongodb')
var moment = require('moment');




module.exports = {
    addNewCar: (carData, imgArray) => {
        delete carData.image
        carData.images = imgArray
        carData.no_of_seats = parseInt(carData.no_of_seats)
        carData.makeyear = parseInt(carData.makeyear)
        carData.no_of_doors = parseInt(carData.no_of_doors)
        carData.price_per_day = parseInt(carData.price_per_day)
        carData.pick_up_address = {
            address: carData.pick_up_address,
            latitude: parseFloat(carData.latitude),
            longitude: parseFloat(carData.longitude)
        }
        delete carData.latitude
        delete carData.longitude

        return new Promise((resolve, reject) => {
            db.get().collection(collections.CARS_COLLECTION).insertOne(carData).then((data) => {
                resolve(data.ops[0]._id)
            })
        })
    },
    updateCar: (carId, carData, imgArray) => {
        delete carData.image
        carData.images = imgArray

        carData.price_per_day = parseInt(carData.price_per_day)
        carData.pick_up_address = {
            address: carData.pick_up_address,
            latitude: parseFloat(carData.latitude),
            longitude: parseFloat(carData.longitude)
        }
        delete carData.latitude
        delete carData.longitude

        return new Promise((resolve, reject) => {
            db.get().collection(collections.CARS_COLLECTION).updateOne({ _id: ObjectId(carId) }, {
                $set: {
                    city: carData.city,
                    price_per_day: carData.price_per_day,
                    pick_up_address: carData.pick_up_address,
                    price_per_day: carData.price_per_day,
                    features: carData.features,
                    discription: carData.discription,
                    images: carData.images
                }
            }).then(() => {
                resolve()
            })
        })
    },

    getAllCars: () => {
        return new Promise(async (resolve, reject) => {
            let cars = await db.get().collection(collections.CARS_COLLECTION).find().sort({ _id: -1 }).toArray()
            resolve(cars)
        })
    },
    deleteCar: (carId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.CARS_COLLECTION).removeOne({ _id: ObjectId(carId) }).then(() => {
                resolve()
            })
        })
    },
    deleteBrand: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.MODELS).removeOne({ _id: ObjectId(brandId) }).then(() => {
                resolve()
            })
        })
    },
    deleteModel: (brand, model, year) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.MODELS).updateOne({ make: brand }, { $pull: { cars: { model: model, year: year } } }).then(() => {
                resolve()
            })
        })
    },
    getCarsByBrand: (Brand) => {
        return new Promise(async (resolve, reject) => {
            let cars = await db.get().collection(collections.CARS_COLLECTION).find({ brand: Brand }).toArray()
            for (x of cars) {
                let offer = await db.get().collection(collections.OFFERS).findOne({ brand: x.brand })

                if (offer) {
                    let newAmt = x.price_per_day - x.price_per_day * parseInt(offer.percentage) / 100
                    x.price_per_day = newAmt
                }
            }
            resolve(cars)
        })
    },
    getCarsByCity: (City) => {
        return new Promise(async (resolve, reject) => {
            let cars = await db.get().collection(collections.CARS_COLLECTION).find({ city: City }).toArray()
            for (x of cars) {
                let offer = await db.get().collection(collections.OFFERS).findOne({ brand: x.brand })

                if (offer) {
                    let newAmt = x.price_per_day - x.price_per_day * parseInt(offer.percentage) / 100
                    x.price_per_day = newAmt
                }
            }
            resolve(cars)
        })
    },
    getCarsDetails: (carId) => {
        return new Promise(async (resolve, reject) => {
            let carDetails = await db.get().collection(collections.CARS_COLLECTION).findOne({ _id: ObjectId(carId) })
            let offer = await db.get().collection(collections.OFFERS).findOne({ brand: carDetails.brand })
            if (offer) {
                let newAmt = carDetails.price_per_day - carDetails.price_per_day * parseInt(offer.percentage) / 100
                carDetails.offerPercentage = offer.percentage
                carDetails.oldPrice = carDetails.price_per_day
                carDetails.price_per_day = newAmt
                resolve(carDetails)
            } else {
                resolve(carDetails)
            }
        })
    },
    getCarsDetailsForEdit: (carId) => {
        return new Promise(async (resolve, reject) => {
            let carDetails = await db.get().collection(collections.CARS_COLLECTION).findOne({ _id: ObjectId(carId) })
            resolve(carDetails)
        })
    },
    getBrandImage: (brandName) => {
        return new Promise(async (resolve, reject) => {
            let brand = await db.get().collection(collections.BRAND_LOGO).findOne({ name: brandName })
            if (brand) {

                resolve(brand.logo)
            }
            resolve()
        })
    },
    addNewModel: (data) => {

        brand = {
            make: data.make,
            cars: [{
                type: data.type,
                model: data.model,
                year: data.year
            }]
        }
        return new Promise(async (resolve, reject) => {
            let car = await db.get().collection(collections.MODELS).findOne({ make: data.make })
            let getBrand = await db.get().collection(collections.BRAND_LOGO).findOne({ name: data.make })
            if (getBrand) {
                brand.logo = getBrand.logo
            }
            if (car) {
                db.get().collection(collections.MODELS).updateOne({ make: car.make }, { $push: { cars: brand.cars[0] } }).then(() => {
                    resolve()
                })
            } else {
                db.get().collection(collections.MODELS).insertOne(brand).then(() => {
                    resolve()
                })
            }
        })
    },
    getAllMakes: () => {
        return new Promise(async (resolve, reject) => {
            cars = []
            let models = await db.get().collection(collections.MODELS).find().toArray()
            if (models) {

                for (i = 0; i < models.length; i++) {
                    car = {
                        _id: models[i]._id,
                        logo: models[i].logo,
                        make: models[i].make,
                        noOfCars: models[i].cars.length
                    }
                    cars.push(car)
                }
                resolve(cars);
            } else {
                resolve()
            }

        })
    },
    getAllModels: (id) => {
        return new Promise(async (resolve, reject) => {
            let models = await db.get().collection(collections.MODELS).findOne({ _id: ObjectId(id) })
            resolve(models)
        })
    },
    getAllBrands: () => {
        let makes = []
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collections.MODELS).find().toArray()
            for (const x of brands) {
                makes.push(x.make)
            }
            resolve(makes)
        })
    },
    getAllModelsByBrand: (make) => {
        let models = []
        return new Promise(async (resolve, reject) => {
            let car = await db.get().collection(collections.MODELS).findOne({ make: make })

            for (x of car.cars) {

                models.push(x.model)
            }
            models = [...new Set(models)]
            resolve(models)
        })
    },
    getAllTypesByBrand: (make, model) => {
        let types = []
        return new Promise(async (resolve, reject) => {
            let car = await db.get().collection(collections.MODELS).findOne({ make: make })

            for (x of car.cars) {
                if (x.model === model) {

                    types.push(x.type)
                }
            }
            types = [...new Set(types)]

            resolve(types)
        })
    },
    getYears: (make, model, type) => {
        let years = []
        return new Promise(async (resolve, reject) => {
            let car = await db.get().collection(collections.MODELS).findOne({ make: make })

            for (x of car.cars) {
                if (x.model === model && x.type === type) {

                    years.push(x.year)
                }
            }
            years = [...new Set(years)]

            resolve(years)
        })
    },
    submitRating: (data, userData) => {
        user = {
            userId: ObjectId(userData._id),
            firstname: userData.firstname,
            lastname: userData.lastname,
            profileimage: userData.profileImage,
            rating: data.rating,
            review: data.review,
            date: new Date()
        }
        reviews = {
            carId: ObjectId(data.carId),
            users: [{
                userId: ObjectId(userData._id),
                firstname: userData.firstname,
                lastname: userData.lastname,
                profileimage: userData.profileImage,
                rating: data.rating,
                review: data.review,
                date: new Date()
            }]
        }
        async function setaverageRating() {
            let review = await db.get().collection(collections.REVIEWS).findOne({ carId: ObjectId(data.carId) })

            let averageRating
            let totalRating = 0
            let noOfReviews = review.users.length
            for (x of review.users) {
                totalRating += x.rating

            }
            averageRating = totalRating / noOfReviews
            review.averageRating = Math.round(averageRating * 10) / 10
            review.noOfReviews = noOfReviews

            await db.get().collection(collections.REVIEWS).updateOne({ carId: ObjectId(data.carId) }, { $set: { averageRating: review.averageRating } })
        }


        return new Promise(async (resolve, reject) => {
            let car = await db.get().collection(collections.REVIEWS).findOne({ carId: ObjectId(data.carId) })
            if (car) {
                let userPosted = await db.get().collection(collections.REVIEWS).findOne({ carId: ObjectId(data.carId), "users.userId": ObjectId(userData._id) })
                if (userPosted) {
                    db.get().collection(collections.REVIEWS).updateOne({ carId: ObjectId(data.carId), "users.userId": ObjectId(userData._id) }, {
                        $set:
                        {
                            "users.$.firstname": user.firstname,
                            "users.$.lastname": user.lastname,
                            "users.$.profileimage": user.profileimage,
                            "users.$.rating": user.rating,
                            "users.$.review": user.review,
                            "users.$.date": user.date
                        }
                    }).then(() => {
                        setaverageRating()
                        resolve()
                    })
                } else {

                    await db.get().collection(collections.REVIEWS).updateOne({ carId: ObjectId(data.carId) }, { $push: { users: user } })

                    setaverageRating()
                    resolve()

                }
            } else {
                await db.get().collection(collections.REVIEWS).insertOne(reviews)

                setaverageRating()
                resolve()

            }
        })
    },

    getAllReviews: (id) => {
        return new Promise(async (resolve, reject) => {

            let review = await db.get().collection(collections.REVIEWS).findOne({ carId: ObjectId(id) })
            if (review) {

                let averageRating
                let totalRating = 0
                let noOfReviews = review.users.length
                for (x of review.users) {
                    totalRating += x.rating
                    x.date = moment(x.date).format('ll')
                }
                averageRating = totalRating / noOfReviews
                review.averageRating = Math.round(averageRating * 10) / 10
                review.noOfReviews = noOfReviews

                db.get().collection(collections.REVIEWS).updateOne({ carId: ObjectId(id) }, { $set: { averageRating: review.averageRating } }).then(() => {

                    resolve(review);
                })
            } else {
                resolve()
            }
        })
    },
    getPopularCars: () => {
        return new Promise(async (resolve, reject) => {
            let popularCar = await db.get().collection(collections.REVIEWS).aggregate([
                {
                    $sort: { averageRating: -1 }
                },
                {
                    $limit: 6
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
                    $unwind: "$cars"
                }
            ]).toArray()
            resolve(popularCar);
        })
    },
    getCarsAverageReview: () => {
        return new Promise(async (resolve, reject) => {
            let carsData = await db.get().collection(collections.REVIEWS).find().toArray()
            resolve(carsData)
        })
    },
    searchCars: (data) => {
        return new Promise(async (resolve, reject) => {
            let bookedCarId = await db.get().collection(collections.CARS_COLLECTION).aggregate([
                {
                    $match:
                    {
                        city: data.location
                    }
                },
                {
                    $lookup:
                    {
                        from: collections.NEW_BOOKINGS,
                        localField: '_id',
                        foreignField: 'carId',
                        as: 'bookings'
                    }
                },
                {
                    $unwind: '$bookings'
                },
                {
                    $match:
                    {
                        $or:
                            [
                                { 'bookings.from': { $lte: data.from }, 'bookings.to': { $gte: data.from } },
                                { 'bookings.from': { $lte: data.to }, 'bookings.to': { $gte: data.to } },
                                { 'bookings.from': { $gte: data.from }, 'bookings.to': { $lte: data.to } }
                            ]
                    }
                },
                {
                    $project: { _id: 1 }
                }
            ]).toArray()
            let carIds = []
            if (bookedCarId[0]) {
                for (x of bookedCarId) {
                    carIds.push(x._id);
                }
            } else {
                console.log('no cars found');
            }

            let cars = await db.get().collection(collections.CARS_COLLECTION).find(
                {
                    city: data.location,
                    _id: { $nin: carIds }
                }
            ).toArray()
            for (x of cars) {
                let offer = await db.get().collection(collections.OFFERS).findOne({ brand: x.brand })

                if (offer) {
                    let newAmt = x.price_per_day - x.price_per_day * parseInt(offer.percentage) / 100
                    x.price_per_day = newAmt
                }
            }
            resolve(cars);

        })
    },
    getCarsCount: () => {
        return new Promise(async (resolve, reject) => {
            let carData = await db.get().collection(collections.CARS_COLLECTION).find().toArray()
            resolve(carData.length);
        })
    },
    sort: (query) => {
        return new Promise(async (resolve, reject) => {
            let cars
            if (query.low_to_high) {
                if (query.brand) {

                    cars = await db.get().collection(collections.CARS_COLLECTION).find({ brand: query.brand }).sort({ price_per_day: 1 }).toArray()
                }
                if (query.city) {

                    cars = await db.get().collection(collections.CARS_COLLECTION).find({ city: query.city }).sort({ price_per_day: 1 }).toArray()
                }
                for (x of cars) {
                    let offer = await db.get().collection(collections.OFFERS).findOne({ brand: x.brand })

                    if (offer) {
                        let newAmt = x.price_per_day - x.price_per_day * parseInt(offer.percentage) / 100
                        x.price_per_day = newAmt
                    }
                }
                resolve(cars)
            }
            if (query.high_to_low) {
                let cars
                if (query.brand) {
                    cars = await db.get().collection(collections.CARS_COLLECTION).find({ brand: query.brand }).sort({ price_per_day: -1 }).toArray()
                }
                if (query.city) {
                    cars = await db.get().collection(collections.CARS_COLLECTION).find({ city: query.city }).sort({ price_per_day: -1 }).toArray()
                }

                for (x of cars) {
                    let offer = await db.get().collection(collections.OFFERS).findOne({ brand: x.brand })

                    if (offer) {
                        let newAmt = x.price_per_day - x.price_per_day * parseInt(offer.percentage) / 100
                        x.price_per_day = newAmt
                    }
                }
                resolve(cars)
            }
            if (query.popularity) {
            }

        })
    },

    filter: (query) => {
        return new Promise(async (resolve, reject) => {

            let cars = await db.get().collection(collections.CARS_COLLECTION).find(
                {

                    $and: [
                        {
                            brand: {
                                $regex: query.brand
                            }
                        },
                        {
                            type: {
                                $regex: query.type
                            }
                        },

                        { makeyear: { $gte: query.fromyear, $lte: query.toyear } },
                        { no_of_seats: { $gte: query.seats } }
                    ]

                }
            ).toArray()
            let carIds = []
            for (x of cars) {
                carIds.push(x._id)
            }

            resolve(carIds);
        })
    },

    getNearestCars: (lat1, lon1) => {

        lat1 = parseFloat(lat1)
        lon1 = parseFloat(lon1)


        return new Promise(async (resolve, reject) => {
            let cars = await db.get().collection(collections.CARS_COLLECTION).find().toArray()
            let nearestCars = []

            for (x of cars) {
                if (x.pick_up_address) {
                    if (x.pick_up_address.latitude) {
                        lat2 = parseFloat(x.pick_up_address.latitude)
                        lon2 = parseFloat(x.pick_up_address.longitude)
                        let unit = "K"

                        var radlat1 = Math.PI * lat1 / 180;
                        var radlat2 = Math.PI * lat2 / 180;
                        var theta = lon1 - lon2;
                        var radtheta = Math.PI * theta / 180;
                        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                        if (dist > 1) {

                            dist = 1;
                        }
                        dist = Math.acos(dist);
                        dist = dist * 180 / Math.PI;
                        dist = dist * 60 * 1.1515;
                        if (unit == "K") { dist = dist * 1.609344 }
                        if (unit == "N") { dist = dist * 0.8684 }

                        if (dist < 10) {
                            dist = Math.round(dist * 10) / 10
                            x.distance = dist
                            nearestCars.push(x)
                        }

                        nearestCars.sort((a, b) => a.distance - b.distance)
                        nearestCars.length = 4

                        resolve(nearestCars);



                    }
                }
            }





        })
    }



}