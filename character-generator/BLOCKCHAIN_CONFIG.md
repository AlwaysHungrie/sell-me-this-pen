# Blockchain Configuration System

This document explains how the blockchain configuration system works and how to add support for new Ethereum L2s.

## Overview

The system has been refactored to support any Ethereum L2 through a flexible configuration system. Instead of hardcoding blockchain-specific logic, the system now uses a configuration-driven approach that makes it easy to add new L2s without modifying core code.

## Current Supported Blockchains

- **Base** - Ethereum L2 by Coinbase
- **Scroll** - ZK-rollup Ethereum L2
- **Solana** - Non-EVM blockchain

## Configuration Structure

Each blockchain is defined by a `BlockchainConfig` interface:

```typescript
interface BlockchainConfig {
  name: string;           // Human-readable name
  rpcUrl: string;         // RPC endpoint URL
  usdcContract: string;   // USDC contract address
  usdcDecimals: number;   // USDC token decimals (usually 6)
  chainId?: number;       // Chain ID (optional)
  explorerUrl?: string;   // Block explorer URL (optional)
}
```

## Adding a New Ethereum L2

### Method 1: Permanent Addition (Recommended)

Add the new L2 configuration to `src/constants/data.ts`:

```typescript
export const EVM_L2_CONFIGS: Record<string, BlockchainConfig> = {
  base: { ... },
  scroll: { ... },
  // Add your new L2 here
  polygon: {
    name: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    usdcDecimals: 6,
    chainId: 137,
    explorerUrl: 'https://polygonscan.com'
  }
} as const;
```

### Method 2: Dynamic Addition

Use the helper function to add L2s at runtime:

```typescript
import { addEVMChain, BlockchainConfig } from './constants/data';
import { TransactionService } from './services/TransactionService';

const newL2Config: BlockchainConfig = {
  name: 'Your L2',
  rpcUrl: 'https://your-l2-rpc.com',
  usdcContract: '0x...',
  usdcDecimals: 6,
  chainId: 12345,
  explorerUrl: 'https://your-explorer.com'
};

// Add to configuration
addEVMChain('your-l2', newL2Config);

// Add to current service instance
const transactionService = new TransactionService();
transactionService.addEVMChain('your-l2', newL2Config);
```

## Required Information for New L2s

To add support for a new Ethereum L2, you need:

1. **RPC URL** - Public or private RPC endpoint
2. **USDC Contract Address** - The official USDC contract on that L2
3. **USDC Decimals** - Usually 6 for USDC
4. **Chain ID** - The L2's chain ID (optional but recommended)

## Example: Adding Polygon

```typescript
const polygonConfig: BlockchainConfig = {
  name: 'Polygon',
  rpcUrl: 'https://polygon-rpc.com',
  usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  usdcDecimals: 6,
  chainId: 137,
  explorerUrl: 'https://polygonscan.com'
};
```

## Example: Adding Optimism

```typescript
const optimismConfig: BlockchainConfig = {
  name: 'Optimism',
  rpcUrl: 'https://mainnet.optimism.io',
  usdcContract: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  usdcDecimals: 6,
  chainId: 10,
  explorerUrl: 'https://optimistic.etherscan.io'
};
```

## Benefits of the New System

1. **Easy Extension** - Add new L2s without touching core logic
2. **Type Safety** - TypeScript ensures configuration correctness
3. **Maintainable** - All blockchain configs in one place
4. **Flexible** - Support both permanent and dynamic additions
5. **Backward Compatible** - Legacy exports still work

## API Changes

The `TransactionService` now supports:

- `TransactionService.getSupportedBlockchains()` - Get list of supported chains
- `transactionService.addEVMChain()` - Add new L2 dynamically
- Generic blockchain parameter instead of hardcoded union types

## Migration Notes

- Ethereum mainnet support has been removed
- Arbitrum support has been removed
- All blockchain types are now string-based for flexibility
- Legacy exports (`USDC_CONTRACTS`, `RPC_URLS`, `USDC_DECIMALS`) are still available for backward compatibility

## Testing New L2s

To test a new L2 configuration:

```typescript
const transactionService = new TransactionService();
const result = await transactionService.analyzeTransaction('your-tx-hash');
console.log('Supported chains:', TransactionService.getSupportedBlockchains());
```

The system will automatically try all configured chains when analyzing a transaction. 