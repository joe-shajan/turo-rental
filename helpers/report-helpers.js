var db = require('../config/connection')
var collections = require('../config/collections')
const moment = require('moment')


module.exports = {
    getTripReports: () => {
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
                },
                {
                    $sort: { to: -1 }
                }
            ]).toArray()
            for (x of bookings) {
                x.from = moment(x.from).format('ll')
                x.to = moment(x.to).format('ll')
                x.profit = x.totalAmount * 15 / 100
            }
            resolve(bookings);
        })
    },
    getTripReportsByDate: (date) => {
        let from = new Date(date.from);
        let to = new Date(date.to);
        let search = {
            from: from,
            to: to
        }
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $match: { to: { $gte: from, $lte: to } }
                },
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
                },
                {
                    $sort: { to: -1 }
                }
            ]).toArray()
            for (x of bookings) {
                x.from = moment(x.from).format('ll')
                x.to = moment(x.to).format('ll')
                x.profit = x.totalAmount * 15 / 100
            }
            search.from = moment(search.from).format('L')
            search.to = moment(search.to).format('L')
            resolve({ bookings, search });
        })
    },
    getSalesReportByCar: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $group:
                    {
                        _id: "$carId",
                        totalTrips: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$cars'
                },
                {
                    $sort: { totalTrips: -1 }
                }
            ]).toArray()
            let sales = {
                totalRevenue: 0
            }
            for (x of bookings) {

                x.profit = x.revenue * 15 / 100
                sales.totalRevenue += x.revenue
            }
            sales.profit = sales.totalRevenue * 15 / 100
            sales.totalRevenue = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.totalRevenue)
            sales.profit = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.profit)
            resolve({ bookings, sales });

        })
    },
    getSalesReportByCity: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([

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
                },
                {
                    $group:
                    {
                        _id: "$cars.city",
                        totalTrips: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $lookup: {
                        from: collections.CITIES,
                        localField: '_id',
                        foreignField: 'cities.city',
                        as: 'city'
                    }
                },
                {
                    $sort: { totalTrips: -1 }
                }

            ]).toArray()
            let sales = {
                totalRevenue: 0
            }
            for (x of bookings) {
                x.profit = x.revenue * 15 / 100
                sales.totalRevenue += x.revenue
                for (y of x.city[0].cities) {
                    if (y.city == x._id) {
                        x.cityImage = y.image
                    }
                }
            }
            sales.profit = sales.totalRevenue * 15 / 100
            sales.totalRevenue = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.totalRevenue)
            sales.profit = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.profit)

            resolve({ bookings, sales });

        })
    },
    getSalesReportByCitySearch: (date) => {
        let from = new Date(date.from);
        let to = new Date(date.to);
        let search = {
            from: from,
            to: to
        }
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $match: { to: { $gte: from, $lte: to } }
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
                },
                {
                    $group:
                    {
                        _id: "$cars.city",
                        totalTrips: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $lookup: {
                        from: collections.CITIES,
                        localField: '_id',
                        foreignField: 'cities.city',
                        as: 'city'
                    }
                },
                {
                    $sort: { totalTrips: -1 }
                }

            ]).toArray()
            let sales = {
                totalRevenue: 0
            }
            for (x of bookings) {
                x.profit = x.revenue * 15 / 100
                sales.totalRevenue += x.revenue
                for (y of x.city[0].cities) {
                    if (y.city == x._id) {
                        x.cityImage = y.image
                    }
                }
            }
            search.from = moment(search.from).format('L')
            search.to = moment(search.to).format('L')
            sales.profit = sales.totalRevenue * 15 / 100
            sales.totalRevenue = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.totalRevenue)
            sales.profit = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.profit)

            resolve({ bookings, sales, search });

        })

    },
    getSalesReportByCarSearch: (date) => {
        let from = new Date(date.from);
        let to = new Date(date.to);
        let search = {
            from: from,
            to: to
        }

        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $match: { to: { $gte: from, $lte: to } }
                },
                {
                    $group:
                    {
                        _id: "$carId",
                        totalTrips: { $sum: 1 },
                        revenue: { $sum: "$totalAmount" }
                    }
                },
                {
                    $lookup: {
                        from: collections.CARS_COLLECTION,
                        localField: '_id',
                        foreignField: '_id',
                        as: 'cars'
                    }

                },
                {
                    $unwind: '$cars'
                },
                {
                    $sort: { totalTrips: -1 }
                }
            ]).toArray()

            let sales = {
                totalRevenue: 0
            }
            for (x of bookings) {

                x.profit = x.revenue * 15 / 100
                sales.totalRevenue += x.revenue
            }
            search.from = moment(search.from).format('L')
            search.to = moment(search.to).format('L')

            sales.profit = sales.totalRevenue * 15 / 100
            sales.totalRevenue = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.totalRevenue)
            sales.profit = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(sales.profit)

            resolve({ bookings, sales, search });

        })
    },
    getTopFiveTripCompletedBrand: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([

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
                },
                {
                    $group:
                    {
                        _id: "$cars.brand",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            let total = 0
            let brand = []
            let percentages = []
            for (x of bookings) {
                total += x.count
            }
            for (x of bookings) {
                brand.push(x._id)
                percent = x.count / total * 100
                rounded = Math.round(percent * 10) / 10
                percentages.push(rounded)
            }
            resolve({ brand, percentages })
        })
    },

    getTopFiveTripCompletedCity: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([

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
                },
                {
                    $group:
                    {
                        _id: "$cars.city",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            let total = 0
            let city = []
            let percentages = []
            for (x of bookings) {
                total += x.count
            }
            for (x of bookings) {
                city.push(x._id)
                percent = x.count / total * 100
                rounded = Math.round(percent * 10) / 10
                percentages.push(rounded)
            }
            resolve({ city, percentages })
        })
    },
    getTopFiveTripBookedByBrand: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.NEW_BOOKINGS).aggregate([

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
                },
                {
                    $group:
                    {
                        _id: "$cars.brand",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            let total = 0
            let brand = []
            let percentages = []
            for (x of bookings) {
                total += x.count
            }
            for (x of bookings) {
                brand.push(x._id)
                percent = x.count / total * 100
                rounded = Math.round(percent * 10) / 10
                percentages.push(rounded)
            }
            resolve({ brand, percentages })
        })
    },
    getTopFiveTripBookedByCity: () => {
        return new Promise(async (resolve, reject) => {
            let bookings = await db.get().collection(collections.NEW_BOOKINGS).aggregate([

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
                },
                {
                    $group:
                    {
                        _id: "$cars.city",
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { count: -1 }
                },
                {
                    $limit: 5
                }
            ]).toArray()
            let total = 0
            let city = []
            let percentages = []
            for (x of bookings) {
                total += x.count
            }
            for (x of bookings) {
                city.push(x._id)
                percent = x.count / total * 100
                rounded = Math.round(percent * 10) / 10
                percentages.push(rounded)
            }
            resolve({ city, percentages })
        })
    },
    getOneWeekRevenue: () => {
        return new Promise(async (resolve, reject) => {
            let to = new Date()
            var from = new Date(to.getTime() - (7 * 24 * 60 * 60 * 1000));

            let bookings = await db.get().collection(collections.COMPLETED_TRIPS).aggregate([
                {
                    $match: { to: { $gte: from, $lte: to } }
                },
                {
                    $group:
                    {
                        _id: null,
                        revenue: { $sum: "$totalAmount" }
                    }
                },
            ]).toArray()
            bookings[0].revenue = new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(bookings[0].revenue)

            resolve(bookings[0].revenue)
        })
    },
    getDayWiseBookingForOneWeek: () => {
        return new Promise(async (resolve, reject) => {
            let arr = []
            let dates = []
            for (i = 0; i < 7; i++) {

                let date = new Date()
                let to = new Date(date.getTime() - (i * 24 * 60 * 60 * 1000))
                var from = new Date(to.getTime() - (1 * 24 * 60 * 60 * 1000));


                let bookings = await db.get().collection(collections.COMPLETED_TRIPS).find({
                    to: { $lte: to, $gte: from }
                }).toArray()
                
                d = (moment(from).format('ll'))
               
                str = d.substring(0, d.length - 6);
                dates.push(str)
                arr.push(bookings.length);
            }
            dates.reverse()
            arr.reverse()
            resolve({arr,dates});
        })
    },
    getSalesForOneWeek: () => {
        return new Promise(async (resolve, reject) => {
            let arr = []
            let dates = []
            for (i = 0; i < 7; i++) {

                let date = new Date()
                let to = new Date(date.getTime() - (i * 24 * 60 * 60 * 1000))
                var from = new Date(to.getTime() - (1 * 24 * 60 * 60 * 1000));


                let bookings = await db.get().collection(collections.COMPLETED_TRIPS).find({
                    to: { $lte: to, $gte: from }
                }).toArray()
                
                d = (moment(from).format('ll'))
                str = d.substring(0, d.length - 6);
                dates.push(str)
                let sum = 0
                for(x of bookings){
                    if(x){
                        sum += x.totalAmount
                    }
                }
                arr.push(sum);
            }
            dates.reverse()
            arr.reverse()
            resolve({arr,dates});
        })
    }
}