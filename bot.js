const app = require('./lib/bot.js')
const database = require('./lib/database')

app().then(() => {
    database.close()
})