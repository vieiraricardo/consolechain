# ConsoleChain

ConsoleChain is a command-line interface (CLI) tool designed for seamless interaction with smart contracts on various blockchain networks.

![ConsoleChain Screenshot](/screenshot-1.png)

## Installation

Install ConsoleChain globally using npm:

```bash
npm install -g consolechain
```

## How to Use

To utilize ConsoleChain, simply invoke the CLI by providing the contract address, the chain name, and the path to the contract's ABI file.

```bash
consolechain 0xB5AD8162a7E6DFBc1d12aF9A494779376B44ed1b --chain syscoin --abi /abi-path/abi.json
```

For ERC-721, ERC-1155, and ERC-20 type contracts, use the `--standard` argument with values `721`, `1155`, or `20`. This loads a generic ABI with predefined methods for the selected standard.

```bash
consolechain 0xB5AD8162a7E6DFBc1d12aF9A494779376B44ed1b --chain syscoin --standard 721
```

To execute methods requiring a connected address, add a private key to the CLI. The key is stored in a file named `consolechain.json` within the `.config/` folder in your operating system's home directory.

```bash
consolechain set-pk your-private-key
```

The CLI features autocompletion; press the tab key to complete a function name or tab twice to view all contract ABI methods. To discover the parameters for function calls, type the function name with the `-h` argument.

![ConsoleChain Autocomplete](/screenshot-2.png)

Finally, to execute a function, type the function name followed by the arguments separated by space.

![ConsoleChain Function Execution](/screenshot-3.png)

## License

MIT - See [LICENSE](LICENSE)
