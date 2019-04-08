const { one } = require('nouns')
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}





const nameGenerator = (options = {}) => {
  let name = capitalize(one() + 'land')
  if (options.hasOwnProperty('db')) {
    while (options.db.indexOf(name) != -1) {
      name = capitalize(one() + 'land')
    }
  }
  return name
}


module.exports = nameGenerator
