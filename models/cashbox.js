const {Schema, model} = require('mongoose')

const cashbox = new Schema({
    cashboxName: {
        type: String,
        required: true,
        unique: true
    },
    sellers:[
        {
            sallerName:{
                type: String,
                required:true
            },
            sallerPassword:{
                type: String,
                required:true
            }
        }
    ],
    sales:{
        type: Number,
        default: 0
    },
    cash:{
        type: Number,
        default: 0
    },
    storage:{
        type: String,
        required: true
    },
    discount:{
        type: Boolean,
        required: true,
        default: false
    }
})

module.exports = model('Cashbox', cashbox)