function paint(objects, cdm) {
  objects.forEach(o => {
    cdm[o.type](o)
  })
}

module.exports = paint
