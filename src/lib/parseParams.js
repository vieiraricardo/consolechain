module.exports = (params) => {
  params = params.map((value) => {
    if (value.match(/^[A-Fx0-9]+$/i)) return value
    // if (!isNaN(+value)) return +value
    if (value.match(/^\[?.*\]$/)) return JSON.parse(value)

    return value
  })

  return params
}
