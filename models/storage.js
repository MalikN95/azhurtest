const {Schema, model} = require('mongoose')

const storage = new Schema({
    name: {
        type: String,
        required: true
    }
}
)

module.exports = model('Storage', storage)