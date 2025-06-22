import { ethers } from 'ethers';
import { Connection, PublicKey, ParsedTransactionWithMeta } from '@solana/web3.js';
import { 
  EVM_L2_CONFIGS, 
  SOLANA_CONFIG, 
  getSupportedEVMChains, 
  getBlockchainConfig,
  BlockchainConfig 
} from '../constants/data';

export interface TransactionInfo {
  isValid: boolean;
  receiverAddress?: string;
  isUSDCTx?: boolean;
  usdcAmount?: string;
  blockchain?: string;
  error?: string;
}

export class TransactionService {
  private providers: Map<string, ethers.JsonRpcProvider>;
  private solanaConnection: Connection;

  constructor() {
    // Initialize providers for all configured EVM L2s
    this.providers = new Map();
    
    for (const [chainKey, config] of Object.entries(EVM_L2_CONFIGS)) {
      this.providers.set(chainKey, new ethers.JsonRpcProvider(config.rpcUrl));
    }

    // Initialize Solana connection
    this.solanaConnection = new Connection(SOLANA_CONFIG.rpcUrl);
  }

  /**
   * Analyze a transaction hash and determine if it's a valid USDC transfer
   * @param txHash - Transaction hash to analyze
   * @returns TransactionInfo with details about the transaction
   */
  async analyzeTransaction(txHash: string): Promise<TransactionInfo> {
    // Try each configured blockchain until we find a valid transaction
    const evmChains = getSupportedEVMChains();
    const allChains = [...evmChains, 'solana'];
    
    for (const chain of allChains) {
      try {
        if (chain === 'solana') {
          const result = await this.analyzeTransactionOnSolana(txHash);
          if (result.isValid) {
            return result;
          }
        } else {
          const result = await this.analyzeTransactionOnChain(txHash, chain);
          if (result.isValid) {
            return result;
          }
        }
      } catch (error) {
        // Continue to next chain if this one fails
      }
    }

    return {
      isValid: false,
      error: 'Transaction not found on any supported blockchain'
    };
  }

  /**
   * Analyze transaction on a specific EVM L2
   */
  private async analyzeTransactionOnChain(
    txHash: string, 
    chain: string
  ): Promise<TransactionInfo> {
    const provider = this.providers.get(chain);
    const config = getBlockchainConfig(chain);
    
    if (!provider || !config) {
      return { 
        isValid: false, 
        error: `Unsupported chain: ${chain}`,
        blockchain: chain 
      };
    }
    
    try {
      // Get transaction receipt
      const receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        return { isValid: false, error: 'Transaction not found' };
      }

      // Check if transaction was successful
      if (receipt.status !== 1) {
        return { 
          isValid: false, 
          error: 'Transaction failed',
          blockchain: chain 
        };
      }

      // Get transaction details
      const tx = await provider.getTransaction(txHash);
      if (!tx) {
        return { isValid: false, error: 'Transaction details not found' };
      }

      // Check if this is a direct USDC transfer (wallet to wallet)
      if (tx.to?.toLowerCase() === config.usdcContract.toLowerCase()) {
        // This is a direct USDC contract call
        return await this.analyzeUSDCDirectCall(tx, receipt, chain, config);
      }

      // Valid transaction but not a direct USDC transfer
      return {
        isValid: true,
        receiverAddress: tx.to || undefined,
        isUSDCTx: false,
        blockchain: chain
      };

    } catch (error) {
      return { 
        isValid: false, 
        error: `Error analyzing on ${chain}: ${error}`,
        blockchain: chain 
      };
    }
  }

  /**
   * Analyze direct USDC contract calls (wallet to wallet transfers)
   */
  private async analyzeUSDCDirectCall(
    tx: ethers.TransactionResponse,
    receipt: ethers.TransactionReceipt,
    chain: string,
    config: BlockchainConfig
  ): Promise<TransactionInfo> {
    try {
      const provider = this.providers.get(chain);
      if (!provider) {
        return { isValid: false, error: `Provider not found for ${chain}` };
      }

      // Parse the transaction data to extract transfer details
      const usdcContract = new ethers.Contract(
        config.usdcContract,
        ['function transfer(address to, uint256 amount)'],
        provider
      );

      const decodedData = usdcContract.interface.parseTransaction({ data: tx.data });
      
      if (decodedData && decodedData.name === 'transfer') {
        const [to, amount] = decodedData.args;
        const usdcAmount = ethers.formatUnits(amount, config.usdcDecimals);

        return {
          isValid: true,
          receiverAddress: to,
          isUSDCTx: true,
          usdcAmount,
          blockchain: chain
        };
      }

      return {
        isValid: true,
        receiverAddress: tx.to || undefined,
        isUSDCTx: false,
        blockchain: chain
      };

    } catch (error) {
      return {
        isValid: true,
        receiverAddress: tx.to || undefined,
        isUSDCTx: false,
        blockchain: chain
      };
    }
  }

  /**
   * Analyze transaction on Solana
   */
  private async analyzeTransactionOnSolana(txHash: string): Promise<TransactionInfo> {
    try {
      // Get transaction details
      const transaction = await this.solanaConnection.getParsedTransaction(txHash, {
        maxSupportedTransactionVersion: 0
      });

      if (!transaction) {
        return { isValid: false, error: 'Transaction not found on Solana' };
      }

      if (transaction.meta?.err) {
        return { 
          isValid: false, 
          error: 'Transaction failed on Solana',
          blockchain: 'solana' 
        };
      }

      // Check for USDC transfers in the transaction
      const usdcTransfers = this.extractSolanaUSDCTransfers(transaction);
      
      if (usdcTransfers.length > 0) {
        const transfer = usdcTransfers[0]; // Get the first USDC transfer
        return {
          isValid: true,
          receiverAddress: transfer.to,
          isUSDCTx: true,
          usdcAmount: transfer.amount,
          blockchain: 'solana'
        };
      }

      // Valid transaction but not USDC
      return {
        isValid: true,
        isUSDCTx: false,
        blockchain: 'solana'
      };

    } catch (error) {
      return { 
        isValid: false, 
        error: `Error analyzing on Solana: ${error}`,
        blockchain: 'solana' 
      };
    }
  }

  /**
   * Extract USDC transfers from Solana transaction
   */
  private extractSolanaUSDCTransfers(transaction: ParsedTransactionWithMeta): Array<{
    to: string;
    amount: string;
  }> {
    const transfers: Array<{ to: string; amount: string }> = [];
    
    if (!transaction.meta?.postTokenBalances || !transaction.meta?.preTokenBalances) {
      return transfers;
    }

    // USDC mint address on Solana
    const usdcMint = SOLANA_CONFIG.usdcContract;

    // Track token balance changes
    const preBalances = new Map<string, number>();
    const postBalances = new Map<string, number>();

    // Initialize pre-balances
    transaction.meta.preTokenBalances.forEach(balance => {
      if (balance.mint === usdcMint && balance.owner) {
        preBalances.set(balance.owner, Number(balance.uiTokenAmount.uiAmount || 0));
      }
    });

    // Calculate post-balances and find transfers
    transaction.meta.postTokenBalances.forEach(balance => {
      if (balance.mint === usdcMint && balance.owner) {
        const postAmount = Number(balance.uiTokenAmount.uiAmount || 0);
        const preAmount = preBalances.get(balance.owner) || 0;
        
        if (postAmount > preAmount) {
          // This address received USDC
          transfers.push({
            to: balance.owner,
            amount: (postAmount - preAmount).toFixed(6)
          });
        }
      }
    });

    return transfers;
  }

  /**
   * Get transaction details for a specific blockchain
   */
  async getTransactionDetails(txHash: string, blockchain: string): Promise<TransactionInfo> {
    if (blockchain === 'solana') {
      return await this.analyzeTransactionOnSolana(txHash);
    } else {
      return await this.analyzeTransactionOnChain(txHash, blockchain);
    }
  }

  /**
   * Validate if a transaction hash format is correct for a specific blockchain
   */
  static validateTransactionHash(txHash: string, blockchain: string): boolean {
    if (blockchain === 'solana') {
      // Solana transaction signature: 88 characters (base58)
      return /^[1-9A-HJ-NP-Za-km-z]{88}$/.test(txHash);
    } else {
      // EVM transaction hash: 66 characters (0x + 64 hex chars)
      return /^0x[a-fA-F0-9]{64}$/.test(txHash);
    }
  }

  /**
   * Get list of supported blockchains
   */
  static getSupportedBlockchains(): string[] {
    return [...getSupportedEVMChains(), 'solana'];
  }

  /**
   * Add a new EVM L2 chain dynamically
   */
  addEVMChain(chainKey: string, config: BlockchainConfig): void {
    // Add to providers
    this.providers.set(chainKey, new ethers.JsonRpcProvider(config.rpcUrl));
    
    // Add to configuration (this would need to be persisted in a real app)
  }
}
