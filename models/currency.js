const {Schema, model} = require('mongoose')

const currency = new Schema({
    num:{
        type: Number,
        required: true
    },
    usd: {
        type: Number,
        required: true
    },
    euro: {
        type: Number,
        required: true
    },
    rub: {
        type: Number,
        required: true
    },
    date: String
})

module.exports = model('Currency', currency)

