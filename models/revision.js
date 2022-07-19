const {Schema, model} = require('mongoose')

const revision = new Schema({
    revisionNum: {
        type: Number,
        required: true
    },
    revisionWorker: {
        type: String,
        required: true
    },
    revisionStorage: {
        type: String,
        required: true
    },
    revisionDate:{
        type: String,
        required: true
    },
    list:[
        {
            revItemName: String,
            revItemId: String,
            revCount:Number,
            revArtiqle: String
        }
    ]
})


module.exports = model('Revision', revision)