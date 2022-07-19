const {Schema, model} = require('mongoose')

const posting = new Schema({
    postingNum: {
        type: Number,
        required: true
    },
    postingWorker: {
        type: String,
        required: true
    },
    postingStorage: {
        type: String,
        required: true
    },
    postingDate:{
        type: String,
        required: true
    },
    list:[]
})


module.exports = model('Posting', posting)