import { TransactionService } from '../services/TransactionService';
import { addEVMChain, BlockchainConfig } from '../constants/data';

/**
 * Example: How to add a new Ethereum L2 to the system
 * 
 * This demonstrates how easy it is to extend the system to support
 * any Ethereum L2 without modifying the core TransactionService code.
 */

// Example: Adding Polygon support
const polygonConfig: BlockchainConfig = {
  name: 'Polygon',
  rpcUrl: 'https://polygon-rpc.com',
  usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  usdcDecimals: 6,
  chainId: 137,
  explorerUrl: 'https://polygonscan.com'
};

// Example: Adding Optimism support
const optimismConfig: BlockchainConfig = {
  name: 'Optimism',
  rpcUrl: 'https://mainnet.optimism.io',
  usdcContract: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  usdcDecimals: 6,
  chainId: 10,
  explorerUrl: 'https://optimistic.etherscan.io'
};

// Example: Adding Arbitrum support (if needed later)
const arbitrumConfig: BlockchainConfig = {
  name: 'Arbitrum',
  rpcUrl: 'https://arb1.arbitrum.io/rpc',
  usdcContract: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  usdcDecimals: 6,
  chainId: 42161,
  explorerUrl: 'https://arbiscan.io'
};

// Function to add a new L2 dynamically
export function addNewL2Support(chainKey: string, config: BlockchainConfig) {
  // Add to the configuration
  addEVMChain(chainKey, config);
  
  // Create a new TransactionService instance (it will automatically pick up the new chain)
  const transactionService = new TransactionService();
  
  // Optionally add the chain to the current service instance
  transactionService.addEVMChain(chainKey, config);
  
  console.log(`✅ Successfully added ${config.name} (${chainKey}) support`);
  console.log(`📊 Supported chains: ${TransactionService.getSupportedBlockchains().join(', ')}`);
}

// Example usage:
// addNewL2Support('polygon', polygonConfig);
// addNewL2Support('optimism', optimismConfig);
// addNewL2Support('arbitrum', arbitrumConfig);

/**
 * To permanently add a new L2, simply add it to the EVM_L2_CONFIGS in constants/data.ts:
 * 
 * export const EVM_L2_CONFIGS: Record<string, BlockchainConfig> = {
 *   base: { ... },
 *   scroll: { ... },
 *   polygon: {
 *     name: 'Polygon',
 *     rpcUrl: 'https://polygon-rpc.com',
 *     usdcContract: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
 *     usdcDecimals: 6,
 *     chainId: 137,
 *     explorerUrl: 'https://polygonscan.com'
 *   }
 * } as const;
 * 
 * That's it! The TransactionService will automatically support the new chain.
 */ 