const {Schema, model} = require('mongoose')

const users = new Schema({
    workerName: {
        type: String,
        required: true
    },
    password:{
        type: String
    },
    position:{
        type: String,
        required:true
    },
    salary:{
        type: Number
    },
    systemAccess:{
        type: Boolean,
        default: false
    },
    superUser:{
        type: Boolean,
        required: true,
        default: false
    }
}
)

module.exports = model('Users', users)