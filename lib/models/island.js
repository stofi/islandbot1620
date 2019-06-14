let mongoose = require('mongoose')

let islandSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
})

module.exports = mongoose.model('island', islandSchema)
