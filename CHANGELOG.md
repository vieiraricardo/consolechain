# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-10-08

### 🎉 Major Changes

- **Chainlist.org Integration** - Access to 1000+ EVM blockchain networks via chainlist.org API
- **Interactive Chain Selection** - Search and select chains interactively with `--interactive` flag
- **Custom RPC Support** - Use any RPC endpoint with `--rpc` option
- **Migrated to TypeScript** - Complete rewrite in TypeScript for enhanced type safety and developer experience
- **Updated to ethers.js v6** - Modernized blockchain interaction with latest ethers.js version
- **Updated to chalk v5** - Enhanced terminal output styling

### ✨ Added

- **list-chains Command** - New command to browse and search available blockchain networks
  - `consolechain list-chains` - Show popular chains
  - `consolechain list-chains polygon` - Search by name
  - `consolechain list-chains 8453` - Search by chain ID
  - Aliases: `ls`, `chains`
- **Interactive Mode** - `--interactive` or `-i` flag for guided chain selection
  - Search functionality with fuzzy matching
  - Shows chain name, ID, native currency, and explorer
  - Auto-selects best RPC endpoint (prioritizes open-source and non-tracking)
- **Custom RPC** - `--rpc` or `-r` flag to use any RPC endpoint
  - `consolechain <address> --rpc https://eth.llamarpc.com --standard 20`
  - Bypasses chain validation when using custom RPC
- **Chain Caching** - Automatic 24-hour cache of chain list for faster access
  - Cached in `~/.config/consolechain_chains.json`
  - Auto-refresh after 24 hours
- **Smart RPC Selection** - Automatically selects best RPC for each chain
  - Prioritizes open-source RPCs
  - Prefers non-tracking endpoints
  - Filters out WebSocket-only endpoints
- **Private Key Encryption** - Secure storage of private keys using AES-256-GCM encryption
  - Set `CONSOLECHAIN_ENCRYPTION_KEY` environment variable to enable encryption
  - Automatic encryption/decryption when saving/loading keys
- **Command History** - Persistent command history across sessions
  - Up to 1000 commands stored in `~/.config/consolechain_history`
  - Accessible via arrow keys in the console
- **Interactive Help System** - New `help` command shows all available functions and commands
- **Chain Validation** - Validates chain names and provides helpful error messages with available chains
- **Private Key Validation** - Validates private key format before saving
- **Environment Variable Support** - Custom RPC URLs via environment variables
  - Support for `ETHEREUM_RPC`, `POLYGON_RPC`, `SYSCOIN_RPC`, etc.
- **Unit Tests** - Added test coverage for core functionality
  - Parameter parsing tests
  - Configuration validation tests
  - Chain validation tests
- **TypeScript Declarations** - Full type definitions for better IDE support
- **Special Console Commands**:
  - `help` - Display available commands and functions
  - `exit` - Exit the console
  - `clear` - Clear the screen

### 🔧 Changed

- **Chain Selection** - `--chain` now accepts any chain name or ID from chainlist.org (1000+ chains)
  - Previously limited to 7 hardcoded chains
  - Now supports: ethereum, polygon, base, arbitrum, optimism, avalanche, fantom, and 1000+ more
- **Chain Validation** - More flexible chain name matching
  - Accepts full name, short name, or chain ID
  - Shows warning when multiple matches found
- **RPC Display** - Console now shows the actual RPC URL being used
- **Contract Creation** - `getContract` now accepts RPC URLs directly

### 🔧 Improved

- **Error Messages** - More descriptive and helpful error messages
- **Parameter Parsing** - Enhanced parsing with better support for:
  - Arrays: `[1,2,3]`
  - Booleans: `true`/`false`
  - Hex strings: `0x...`
  - Strings with spaces: `'hello world'`
- **ABI Loading** - Better error messages when ABI files are not found
- **Function Signatures** - Fixed display bug in `parseAbiFunctionParams`
- **Code Organization** - Modularized codebase with better separation of concerns
- **Build Process** - Optimized TypeScript compilation and output

### 🔒 Security

- **Encrypted Storage** - Private keys can now be encrypted at rest
- **Environment Variables** - Sensitive data moved to environment variables
- **Key Validation** - Validates private key format to prevent invalid entries
- **No Hardcoded Keys** - Removed hardcoded Infura API keys from source code

### 🏗️ Infrastructure

- **New Types** - Added comprehensive Chainlist.org type definitions
  - `ChainlistChain`, `ChainlistRpc`, `ChainlistExplorer`, etc.
- **New Modules**:
  - `src/lib/chainlist.ts` - Chainlist.org API integration
  - `src/lib/selectChain.ts` - Interactive chain selection
  - `src/commands/listChains.ts` - List chains command
- **TypeScript Build** - New build system with `npm run build`
- **Development Mode** - Added `npm run dev` for development with ts-node
- **Updated Dependencies** - All dependencies updated to latest stable versions
- **ESLint Configuration** - Updated for TypeScript support
- **Jest Configuration** - Configured for TypeScript testing with ts-jest

### 📝 Documentation

- **Updated README** - Complete rewrite with new features
  - 3 ways to connect: interactive, by name, or custom RPC
  - Chain selection examples
  - list-chains command documentation
- **New Examples** - Added examples for all connection methods
- **Enhanced README** - Comprehensive guide with examples and best practices
- **Environment Example** - Added `.env.example` with all configuration options
- **Security Guidelines** - Added security best practices to documentation
- **Migration Guide** - Instructions for upgrading from v0.1.x

### ⚡ Performance

- **Chain List Caching** - 24-hour cache reduces API calls
- **Lazy Loading** - Chain list only fetched when needed

### 🐛 Fixed

- Fixed chain parameter type to accept any string (not just predefined chains)
- Fixed parameter parsing for complex types
- Fixed function signature display bug
- Fixed handling of numbers in parameter parsing
- Removed commented-out dead code

### ⚠️ Breaking Changes

- Minimum Node.js version is now 16.x or higher
- Binary location changed from `bin/consolechain` to `build/cli.js`
- Configuration file structure changed (migration happens automatically)
- Some internal APIs changed due to TypeScript migration

### 📦 Dependencies

**Added:**

- `typescript@^5.6.3`
- `ts-node@^10.9.2`
- `ts-jest@^29.2.5`
- `@types/node@^22.7.9`
- `dotenv@^16.4.5`

**Updated:**

- `ethers@^6.13.4` (from v5.6.8)
- `chalk@^5.3.0` (from v4.1.2)
- `gluegun@^5.2.0` (from latest)
- `jest@^29.7.0` (from v26.6.3)
- `prettier@^3.3.3` (from v2.2.1)
- `eslint@^8.57.1` (from v7.22.0)

## [0.1.8] - 2024-04-29

### Changed

- Updated Mumbai RPC endpoint
- Minor documentation updates

## [0.1.7] - 2023-07-17

### Added

- Support for Rollux chain

### Fixed

- Parse spaced string values

## [Previous Versions]

See git history for details on versions prior to 0.1.7

---

[0.2.0]: https://github.com/vieiraricardo/consolechain/compare/v0.1.8...v0.2.0
[0.1.8]: https://github.com/vieiraricardo/consolechain/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/vieiraricardo/consolechain/releases/tag/v0.1.7
