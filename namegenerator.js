const { one } = require('nouns')
const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}





const nameGenerator = options => {
  return capitalize(one() + 'land')
}


module.exports = nameGenerator
