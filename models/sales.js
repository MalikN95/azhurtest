const {Schema, model} = require('mongoose')

const sales = new Schema({
    salesNum: {
        type: Number,
        required: true
    },
    salesWorker: {
        type: String,
        required: true
    },
    salesStorage: {
        type: String,
        required: true
    },
    salesCashbox: {
        type: String,
        required: true
    },
    salesDate:{
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    salesDay:{
        type: Number,
        required: true
    },
    salesSum:{
        type: Number,
        required: true
    },
    list:[{
        itemName:{
            type: String,
            required: true
        },
        itemCount:{
            type: Number,
            required: true
        },
        itemId:{
            type: String,
            required: true
        },
        itemPrice:{
            type: Number,
            required: true
        },
        salesPrice:{
            type: Number,
            required: true
        },
        itemDiscount:Number
    }]
}
)


module.exports = model('Sales', sales)