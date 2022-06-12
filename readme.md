# consolechain

A CLI to interact with smart contracts.

![](/screenshot-1.png)

## Instalation

```shell
npm install -g consolechain
```

## How to use

Just call the CLI by passing the contract address, the chain name and a path to the contract's abi file.

```shell
consolechain 0xB5AD8162a7E6DFBc1d12aF9A494779376B44ed1b --chain syscoin --abi /abi-path/abi.json
```

To interact with ERC-721, ERC-1155 and ERC-20 type contracts add the standard argument with one of the following values `721`, `1155` or `20`. This will load a generic abi with predefined methods for the chosen standard.

```shell
consolechain 0xB5AD8162a7E6DFBc1d12aF9A494779376B44ed1b --chain syscoin --standard 721
```

To execute methods that need a connected address, you need to add a private key to the CLI, it will store the key in a file called `consolechain.json` in the `.config/` folder in your operating system's home folder.

```shell
consolechain set-pk your-private-key
```

The cli has autocomplete so you just need to press tab key to complete a function name or press tab 2x to see all contract abi methods.

To know which parameters to pass to the function calls type the function name with the -h argument.

![](/screenshot-2.png)

finally, to execute a function type the name of the function followed by the arguments separated by space

![](/screenshot-3.png)

# License

MIT - see LICENSE
