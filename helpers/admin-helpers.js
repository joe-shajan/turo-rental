var db = require('../config/connection')
var collections = require('../config/collections')
var { ObjectId } = require('mongodb')

module.exports = {
    //admin login
    doLogin: (adminData) => {
        console.log(adminData);
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collections.ADMIN_COLLECTION).findOne({ username: adminData.username })
            console.log(admin);
            if (admin) {
                if (admin.password === adminData.password) {
                    response.admin = admin
                    response.status = true
                    resolve(response)

                } else {
                    resolve({ status: false })
                }

            } else {
                resolve({ status: false })
            }
        })
    }
}