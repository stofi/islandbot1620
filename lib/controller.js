const IslandModel = require('./models/island')

const getNames = () => {
    return new Promise((resolve, reject) => {
        IslandModel.find()
            .then(result => resolve(result.map(item => item.name)))
            .catch(reject)
    })
}
const addName = name => {
    let island = new IslandModel({ name })
    return island.save()
}

module.exports = { getNames, addName }