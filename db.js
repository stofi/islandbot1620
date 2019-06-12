const fs = require('fs').promises

const getDatabase = async () => {

    const file = await fs.readFile(__dirname + '/db', 'utf8')
    const db = file.split('\n').filter(i => i.trim() !== '')

    return db
}

module.exports = getDatabase