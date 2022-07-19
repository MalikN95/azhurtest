const { type } = require('express/lib/response')
const {Schema, model} = require('mongoose')

const nomen = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    artiqle:{
        type: String,
        required:true,
        trim: true
    },
    barcode:{
        type: String
    },
    cost:{
        type: Number,
        required:true,
        trim: true,
        default: 0
    },
    price:{
        type: Number,
        required:true,
        trim: true,
        default: 0
    },
    img:{
        type: String
    },
    unit:{
        type: String,
        required: true,
        default: "шт."
    },
    category:{
        type: String
    },
    storage:[
        {
            storageId:{
               type: String,
               required: true
            },
            count:{
                type: Number,
                default: 0
            }
        }
    ]    
}
)

module.exports = model('Nomen', nomen)