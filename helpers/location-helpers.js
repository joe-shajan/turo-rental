var db = require('../config/connection')
var collections = require('../config/collections')
var { ObjectId } = require('mongodb')


module.exports = {
    getallState: () => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.ALL_LOCATIONS).find().toArray()

            if (data[0]) {
                let states = Object.keys(data[0])
                states.shift()
                resolve(states)
            } else {
                resolve()
            }
        })
    },
    getallCity: (state) => {
        return new Promise(async (resolve, reject) => {
            let data = await db.get().collection(collections.ALL_LOCATIONS).find().toArray()
            values = data[0][state]
            resolve(values);


        })


    },
    addCity: (body, filename) => {
        city = {
            state: body.state,
            cities: [{
                city: body.city,
                image: filename
            }]
        }
        return new Promise(async (resolve, reject) => {
            let state = await db.get().collection(collections.CITIES).findOne({ state: city.state })
            if (state) {
                let citys = await db.get().collection(collections.CITIES).find({ state: city.state, 'cities.city': city.cities[0].city }).toArray()
                if (citys[0]) {
                    resolve()
                } else {
                    db.get().collection(collections.CITIES).updateOne({ state: state.state }, { $push: { cities: city.cities[0] } }).then(() => {
                        resolve()
                    })
                }
            } else {
                db.get().collection(collections.CITIES).insertOne(city).then(() => {
                    resolve()
                })
            }
        })
    },
    getCity:()=>{
        return new Promise(async(resolve,reject)=>{
            allCities = []
            let city = await db.get().collection(collections.CITIES).find().project({cities:1,_id:0}).toArray()
            for(x of city){
                allCities.push(x.cities[0])
            }
            resolve(allCities)
        })

    },
    getCityNames:()=>{
        return new Promise(async(resolve,reject)=>{
            allCities = []
            let city = await db.get().collection(collections.CITIES).find().project({cities:1,_id:0}).toArray()
            for(x of city){
                allCities.push(x.cities[0].city)
            }
            resolve(allCities)
        })

    },
    showState:()=>{
        return new Promise(async(resolve,reject)=>{
            states = []
            let Allstates =  await db.get().collection(collections.CITIES).find().toArray()
            if(Allstates){

                for(i=0;i<Allstates.length;i++){
                    state = {
                        _id:Allstates[i]._id,
                        state:Allstates[i].state,
                        noOfCities:Allstates[i].cities.length
                    }
                    states.push(state)
                }
                resolve(states);
            }else{
                resolve()
            }
        })
    },
    deleteState:(stateId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CITIES).removeOne({_id:ObjectId(stateId)}).then(()=>{
                resolve()
            })
        })
    },
    showCities:(id)=>{
        return new Promise(async(resolve,reject)=>{
           let city = await db.get().collection(collections.CITIES).findOne({_id:ObjectId(id)})
           resolve(city);
        })
    },
    deleteCity:(state,city)=>{
       
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collections.CITIES).updateOne({state:state},{$pull:{cities:{city:city}}}).then(()=>{
                resolve()
            })
        })
    }
}