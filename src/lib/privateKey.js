module.exports = async (toolbox) => {
  const { parameters, filesystem } = toolbox
  const home = process.env['HOME']

  const privateKey = parameters.first

  filesystem.write(`${home}/.config/consolechain.json`, { privateKey })
}
