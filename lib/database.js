let mongoose = require('mongoose')

const server = '127.0.0.1:27017'
const database = 'islandbotdb'

const database_url = process.env.MONGO_URL || `mongodb://${server}/${database}`

class Database {
    constructor() {
        this._connect()
    }

    _connect() {
        mongoose.connect(database_url, { useNewUrlParser: true })
            .then(() => {
                console.log('Database connection successful')
            })
            .catch(err => {
                console.error('Database connection error')
            })
    }

    close() {
        mongoose.connection.close()
            .then(() => {
                console.log('Database connection closed')
            })
            .catch(err => {
                console.error('Error closing database connection')
            })
    }
}

module.exports = new Database()