const IslandModel = require('./models/island')

const getNames = () => {
    return new Promise((resolve, reject) => {
        IslandModel.find()
            .then(result => resolve(result.map(item => item.name)))
            .catch(reject)
    })
}

module.exports = getNamesgs