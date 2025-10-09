# Migration Guide: v0.1.x → v0.2.0

This guide helps you migrate from ConsoleChain v0.1.x to v0.2.0.

## Breaking Changes

### 1. Node.js Version Requirement
- **Old:** Node.js 12+
- **New:** Node.js 16+

**Action:** Update your Node.js installation if needed:
```bash
node --version  # Should be 16.x or higher
```

### 2. Package Installation

The package structure has changed. After upgrading, you may need to reinstall:

```bash
npm uninstall -g consolechain
npm install -g consolechain@latest
```

### 3. Configuration File Migration

The configuration file is automatically migrated, but you should be aware of the new structure:

**Old:** `~/.config/consolechain.json`
```json
{
  "privateKey": "0x..."
}
```

**New:** `~/.config/consolechain.json` (with optional encryption)
```json
{
  "encryptedPrivateKey": "..."
}
```

**Action:** No action required - migration happens automatically. However, we recommend encrypting your key:

```bash
export CONSOLECHAIN_ENCRYPTION_KEY=$(openssl rand -hex 32)
# Re-save your private key to encrypt it
consolechain set-pk your-private-key
```

### 4. Environment Variables (New)

v0.2.0 introduces support for custom RPC endpoints via environment variables.

**Recommended:** Create a `.env` file in your project:

```bash
# Copy the example file
cp .env.example .env

# Edit with your values
CONSOLECHAIN_ENCRYPTION_KEY=your-key-here
ETHEREUM_RPC=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
```

## New Features to Try

### 1. Private Key Encryption

Encrypt your private key for better security:

```bash
# Set encryption key
export CONSOLECHAIN_ENCRYPTION_KEY=$(openssl rand -hex 32)

# Save it to your shell profile
echo 'export CONSOLECHAIN_ENCRYPTION_KEY="your-key-here"' >> ~/.bashrc

# Set your private key (will be encrypted automatically)
consolechain set-pk your-private-key
```

### 2. Command History

Commands are now persisted across sessions. Use arrow keys to navigate:
- ↑ - Previous command
- ↓ - Next command

### 3. Interactive Help

New help system inside the console:

```bash
consolechain 0xAddress --chain ethereum --standard 20
Ξ help
```

### 4. Enhanced Error Messages

Errors are now more descriptive:

```bash
# Old: "invalid ethereum address"
# New: "Error: Invalid Ethereum address provided
#      Usage: consolechain <address> --chain <chain> [--abi <path> | --standard <20|721|1155>]"
```

### 5. Chain Validation

Invalid chains now show available options:

```bash
# New in v0.2.0
consolechain 0xAddress --chain invalidchain --standard 20
# Error: Invalid chain: invalidchain
# Available chains: ethereum, goerli, polygon, mumbai, syscoin, bedrock, rollux
```

## Updated API (for developers)

If you're building on top of ConsoleChain or using it as a library:

### ethers.js v6 Changes

```typescript
// Old (ethers v5)
import { ethers } from 'ethers'
const provider = new ethers.providers.JsonRpcProvider(url)
const signer = new ethers.Wallet(key, provider)

// New (ethers v6)
import { ethers, JsonRpcProvider, Wallet } from 'ethers'
const provider = new JsonRpcProvider(url)
const signer = new Wallet(key, provider)
```

### TypeScript Support

```typescript
// You can now import types
import { ChainName, StandardType, ConsoleOptions } from 'consolechain'

const chain: ChainName = 'ethereum'
const standard: StandardType = '721'
```

## Testing Your Migration

After upgrading, test basic functionality:

```bash
# 1. Check version
consolechain --version  # Should show 0.2.0

# 2. Test basic connection (read-only)
consolechain 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 \
  --chain ethereum --standard 20

# Inside console:
Ξ name
Ξ symbol
Ξ decimals
Ξ exit

# 3. Test with private key (if you use one)
consolechain set-pk your-test-private-key
```

## Rollback Instructions

If you need to rollback to v0.1.8:

```bash
npm uninstall -g consolechain
npm install -g consolechain@0.1.8
```

Note: Your encrypted configuration will not work with v0.1.8. Back up your private key before rollback.

## Getting Help

If you encounter issues:

1. Check the [README.md](./README.md) for updated documentation
2. Review the [CHANGELOG.md](./CHANGELOG.md) for all changes
3. Open an issue on [GitHub](https://github.com/vieiraricardo/consolechain/issues)

## Summary

v0.2.0 is a major upgrade focused on:
- ✅ Type safety with TypeScript
- ✅ Better security with encryption
- ✅ Improved developer experience
- ✅ Modern dependencies

Most changes are backwards compatible, but we recommend taking advantage of the new security features, especially private key encryption.
