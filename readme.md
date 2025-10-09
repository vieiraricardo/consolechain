# ConsoleChain

ConsoleChain is a powerful command-line interface (CLI) tool for seamless interaction with smart contracts on various blockchain networks. Built with TypeScript for enhanced type safety and developer experience.

![ConsoleChain Screenshot](/consolechain.png)

## Features

- **1000+ Chains** - Access any EVM chain via [chainlist.org](https://chainlist.org) integration
- **RPC Fallback System** - Automatically uses backup RPCs if primary fails
- **Smart Chain Selection** - Simple UI showing only chain slugs
- **Custom RPC Support** - Use any RPC endpoint you prefer
- **Secure Private Key Storage** - Optional encryption for your keys
- **Interactive REPL** - Autocomplete, command history, and help system
- **Type Safety** - Built with TypeScript
- **Standard Support** - Built-in ABIs for ERC-20, ERC-721, and ERC-1155

## Installation

Install ConsoleChain globally using npm:

```bash
npm install -g consolechain
```

## Quick Start

### Option 1: Let CLI Ask for Chain (Recommended)

Just provide the contract address - CLI will prompt you to select the chain:

```bash
consolechain 0xYourContractAddress --standard 20

# You'll be prompted:
# 🔗 Select a blockchain network
# ? Search (name, symbol, or chain ID): ethereum
# ? Select chain: ethereum
```

### Option 2: Specify Chain by Name

```bash
consolechain 0xYourContractAddress --chain ethereum --standard 721
consolechain 0xYourContractAddress --chain polygon --standard 20
consolechain 0xYourContractAddress --chain base --abi ./abi.json
```

### Option 3: Custom RPC URL

Use any RPC endpoint directly:

```bash
consolechain 0xYourContractAddress --rpc https://eth.llamarpc.com --standard 20
```

### List Available Chains

```bash
# Show popular chains
consolechain list-chains

# Search for specific chains
consolechain list-chains polygon
consolechain list-chains arbitrum
consolechain list-chains 8453  # Search by chain ID
```

### Setting Up Your Private Key

To execute transactions that modify state, set your private key:

```bash
consolechain set-pk your-private-key-here
```

**🔒 Security Best Practice:** Set the `CONSOLECHAIN_ENCRYPTION_KEY` environment variable to encrypt your private key:

```bash
export CONSOLECHAIN_ENCRYPTION_KEY=$(openssl rand -hex 32)
consolechain set-pk your-private-key
```

## 🎮 Interactive Console

Once connected, you have access to several features:

### Autocomplete

- Press `TAB` to autocomplete function names
- Press `TAB` twice to see all available functions

### Get Function Help

```
Ξ balanceOf -h
balanceOf(owner: address)
```

### Call Functions

```
Ξ balanceOf 0x1234567890123456789012345678901234567890
  1000000000000000000
```

### Special Commands

- `help` - Show available commands
- `exit` - Exit the console
- `clear` - Clear the screen

## Chain Selection Examples

### Interactive Selection

```bash
# Start interactive mode
consolechain 0xYourAddress --interactive --standard 721

# You'll be prompted to:
# 1. Search for a chain (e.g., "base", "polygon", "arbitrum")
# 2. Select from matching results
# 3. Automatically connects with best RPC
```

### Direct Chain Selection

```bash
# Ethereum Mainnet
consolechain 0xAddress --chain ethereum --standard 20

# Polygon
consolechain 0xAddress --chain polygon --standard 721

# Base
consolechain 0xAddress --chain base --standard 1155

# Arbitrum
consolechain 0xAddress --chain arbitrum --abi ./MyContract.json

# Any chain by ID
consolechain 0xAddress --chain 8453 --standard 20  # Base
```

### Custom RPC Examples

```bash
# Use a specific RPC provider
consolechain 0xAddress --rpc https://eth.llamarpc.com --standard 20

# Use your own node
consolechain 0xAddress --rpc http://localhost:8545 --abi ./abi.json

# Use a premium RPC service
consolechain 0xAddress --rpc https://mainnet.infura.io/v3/YOUR_KEY --standard 721
```

## Examples

### Interacting with USDC on Ethereum

```bash
# Using chain name
consolechain 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 --chain ethereum --standard 20

# Inside console
Ξ name
  USD Coin
Ξ symbol
  USDC
Ξ decimals
  6
Ξ totalSupply
  24835236580839861
```

### Interacting with NFTs on Base

```bash
# Interactive mode
consolechain 0xYourNFTAddress --interactive --standard 721

# Search for "base" → Select "Base" → Auto-connects
Ξ name
Ξ ownerOf 1
```

### Using Custom ABI

```bash
consolechain 0xCustomContract --chain arbitrum --abi ./MyContract.json
Ξ myCustomFunction arg1 arg2
```

### Passing Complex Arguments

```bash
# Arrays
Ξ batchTransfer '["0xAddr1","0xAddr2"]' '[100,200]'

# Strings with spaces
Ξ setName 'My Token Name'

# Numbers
Ξ setValue 123456

# Booleans
Ξ setFlag true
```

## Commands

| Command                  | Aliases        | Description                                        |
| ------------------------ | -------------- | -------------------------------------------------- |
| `consolechain <address>` | -              | Interactive console for smart contract interaction |
| `list-chains [search]`   | `ls`, `chains` | List and search available blockchain networks      |
| `set-pk <key>`           | -              | Set your private key for signing transactions      |
| `--help`                 | `-h`           | Show help information                              |
| `--version`              | `-v`           | Show version number                                |

### Command Options

| Option              | Alias | Description                      |
| ------------------- | ----- | -------------------------------- |
| `--chain <name>`    | `-c`  | Specify chain by name or ID      |
| `--rpc <url>`       | `-r`  | Use custom RPC URL               |
| `--interactive`     | `-i`  | Interactive chain selection      |
| `--standard <type>` | `-s`  | Use standard ABI (20, 721, 1155) |
| `--abi <path>`      | -     | Path to custom ABI file          |

## Development

### Build from Source

```bash
git clone https://github.com/vieiraricardo/consolechain.git
cd consolechain
npm install
npm run build
npm link
```

### Run Tests

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [GitHub Repository](https://github.com/vieiraricardo/consolechain)
- [npm Package](https://www.npmjs.com/package/consolechain)
- [Report Issues](https://github.com/vieiraricardo/consolechain/issues)
- [Chainlist.org](https://chainlist.org) - Chain data source

## Security Notice

- Always use the encryption feature for private key storage
- Use testnets for development and testing
- Verify contract addresses and chain IDs before executing transactions
- When using custom RPCs, ensure they are from trusted sources
