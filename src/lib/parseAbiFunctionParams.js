module.exports = (functionName, inputs) => {
  const params = inputs.map((input) => [input.name, input.type])

  const parsedParams = params.flatMap((elem) =>
    elem.toString().replace(',', ': ')
  )

  const paramsHelpString = `${functionName}(${parsedParams})`

  return paramsHelpString
}
