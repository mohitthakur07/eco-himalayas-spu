import { ethers } from 'ethers';
import crypto from 'crypto';

class SimpleBlockchain {
  constructor() {
    // Validate environment variables
    if (!process.env.BLOCKCHAIN_PRIVATE_KEY) {
      console.error('❌ BLOCKCHAIN_PRIVATE_KEY not set in .env file');
      throw new Error('BLOCKCHAIN_PRIVATE_KEY is required');
    }

    if (process.env.BLOCKCHAIN_PRIVATE_KEY === 'your_metamask_private_key_here') {
      console.error('❌ Please replace placeholder with your actual MetaMask private key');
      console.error('   How to get it:');
      console.error('   1. Open MetaMask → Click 3 dots → Account Details');
      console.error('   2. Click "Show Private Key" → Enter password');
      console.error('   3. Copy the key (should start with 0x)');
      console.error('   4. Paste it in server/.env as: BLOCKCHAIN_PRIVATE_KEY=0x...');
      throw new Error('Invalid BLOCKCHAIN_PRIVATE_KEY - still using placeholder');
    }

    if (!process.env.BLOCKCHAIN_PRIVATE_KEY.startsWith('0x')) {
      console.error('❌ Private key must start with 0x');
      console.error('   Current format:', process.env.BLOCKCHAIN_PRIVATE_KEY.substring(0, 10) + '...');
      console.error('   Required format: 0x1234567890abcdef...');
      throw new Error('Invalid private key format - must start with 0x');
    }

    if (process.env.BLOCKCHAIN_PRIVATE_KEY.length !== 66) {
      console.error('❌ Private key must be 66 characters (0x + 64 hex chars)');
      console.error('   Current length:', process.env.BLOCKCHAIN_PRIVATE_KEY.length);
      console.error('   Required length: 66');
      throw new Error('Invalid private key length');
    }

    try {
      // Connect to Polygon Amoy testnet
      this.provider = new ethers.JsonRpcProvider(
        process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology'
      );
      
      // Your wallet (to send transactions)
      this.wallet = new ethers.Wallet(
        process.env.BLOCKCHAIN_PRIVATE_KEY,
        this.provider
      );
      
      console.log('✅ Blockchain connected');
      console.log('   Wallet:', this.wallet.address);
      console.log('   Network: Polygon Amoy');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      console.error('\n📝 Troubleshooting:');
      console.error('   1. Check your private key in server/.env');
      console.error('   2. Make sure it starts with 0x');
      console.error('   3. Make sure it\'s 66 characters long');
      console.error('   4. No quotes or extra spaces around the key');
      console.error('\n   Get private key from MetaMask:');
      console.error('   MetaMask → 3 dots → Account Details → Show Private Key');
      throw error;
    }
  }
  
  /**
   * Create proof hash for an action
   * This is like a fingerprint of the action
   */
  createProofHash(data) {
    const dataString = JSON.stringify(data);
    return crypto.createHash('sha256').update(dataString).digest('hex');
  }
  
  /**
   * Store proof on blockchain
   * We send a transaction with the proof hash
   */
  async storeProof(proofHash, metadata) {
    try {
      console.log('📝 Storing proof on blockchain...');
      
      // Polygon Amoy's getFeeData() returns unreliable 1 gwei values
      // We must use fixed minimums and manually sign transactions
      // Using ABSOLUTE MINIMUM for test phase to conserve funds
      const priorityFee = ethers.parseUnits('25', 'gwei'); // Network minimum = 25 gwei
      const maxFee = ethers.parseUnits('50', 'gwei'); // Lowest safe maxFee
      
      console.log(`   💰 Gas prices: priority=${ethers.formatUnits(priorityFee, 'gwei')} gwei, max=${ethers.formatUnits(maxFee, 'gwei')} gwei`);
      
      // Get nonce and chain ID manually
      const nonce = await this.wallet.getNonce();
      const chainId = (await this.provider.getNetwork()).chainId;
      
      // Create fully populated transaction (avoid wallet.sendTransaction() - it overrides gas!)
      const fullyPopulatedTx = {
        to: this.wallet.address,
        value: 0,
        data: '0x' + Buffer.from(proofHash).toString('hex'),
        gasLimit: 40000, // Reduced from 50k for lower cost (simple self-transfer uses ~21k)
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee,
        nonce: nonce,
        chainId: chainId,
        type: 2 // EIP-1559
      };
      
      // Sign and broadcast manually to maintain control over gas prices
      const signedTx = await this.wallet.signTransaction(fullyPopulatedTx);
      const tx = await this.provider.broadcastTransaction(signedTx);
      
      console.log('⏳ Transaction sent:', tx.hash);
      console.log('   ⏱️  Waiting for confirmation...');
      
      // Wait for confirmation - use provider to avoid ethers parsing bug
      const receipt = await this.provider.waitForTransaction(tx.hash);
      
      console.log('✅ Proof stored on blockchain!');
      console.log('   Block:', receipt.blockNumber);
      console.log('   TX:', receipt.hash);
      
      // Calculate actual cost (EIP-1559)
      const effectiveGasPrice = receipt.gasPrice || (receipt.effectiveGasPrice || maxFee);
      const actualCost = ethers.formatEther(receipt.gasUsed * effectiveGasPrice);
      console.log('   💸 Cost:', actualCost, 'POL (~$', (parseFloat(actualCost) * 0.50).toFixed(4), 'USD)');
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`,
        proofHash: proofHash
      };
    } catch (error) {
      console.error('❌ Blockchain error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Verify proof exists on blockchain
   */
  async verifyProof(transactionHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { verified: false, message: 'Transaction not found' };
      }
      
      return {
        verified: true,
        blockNumber: receipt.blockNumber,
        timestamp: (await this.provider.getBlock(receipt.blockNumber)).timestamp,
        explorerUrl: `https://amoy.polygonscan.com/tx/${transactionHash}`
      };
    } catch (error) {
      return { verified: false, error: error.message };
    }
  }
  
  /**
   * Send blockchain tokens to user based on credits earned
   * ULTRA-MINIMAL CONVERSION: 1 credit = 1 wei (smallest possible unit!)
   * Example: 45 credits = 45 wei = 0.000000000000000045 POL
   * This maximizes test transactions with limited balance
   */
  async sendRewardToUser(userWalletAddress, credits) {
    try {
      console.log(`💎 Sending blockchain reward: ${credits} credits → ${userWalletAddress}`);
      
      if (!userWalletAddress || !ethers.isAddress(userWalletAddress)) {
        console.log('⚠️  Invalid wallet address, skipping blockchain reward');
        return { success: false, error: 'Invalid wallet address' };
      }
      
      // Convert credits to wei: 1 credit = 1 wei (absolute minimum!)
      const creditsAmount = BigInt(Math.floor(credits));
      const rewardAmount = creditsAmount; // Direct wei amount
      
      console.log(`   💰 Amount: ${ethers.formatEther(rewardAmount)} POL`);
      
      // Check if we have enough balance
      const balance = await this.wallet.provider.getBalance(this.wallet.address);
      if (balance < rewardAmount) {
        console.log('⚠️  Insufficient balance for reward');
        return { success: false, error: 'Insufficient balance' };
      }
      
      // Gas settings (same as proof storage)
      const priorityFee = ethers.parseUnits('25', 'gwei');
      const maxFee = ethers.parseUnits('50', 'gwei');
      
      // Get nonce and chain ID
      const nonce = await this.wallet.getNonce();
      const chainId = (await this.provider.getNetwork()).chainId;
      
      // Create transaction to send tokens
      const rewardTx = {
        to: userWalletAddress,
        value: rewardAmount, // Actual POL transfer!
        gasLimit: 21000, // Standard ETH transfer
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: priorityFee,
        nonce: nonce,
        chainId: chainId,
        type: 2
      };
      
      // Sign and broadcast
      const signedTx = await this.wallet.signTransaction(rewardTx);
      const tx = await this.provider.broadcastTransaction(signedTx);
      
      console.log('⏳ Reward transaction sent:', tx.hash);
      
      // Wait for confirmation
      const receipt = await this.provider.waitForTransaction(tx.hash);
      
      console.log('✅ Blockchain reward sent!');
      console.log('   TX:', receipt.hash);
      console.log('   💸 User received:', ethers.formatEther(rewardAmount), 'POL');
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        amount: ethers.formatEther(rewardAmount),
        explorerUrl: `https://amoy.polygonscan.com/tx/${receipt.hash}`
      };
    } catch (error) {
      console.error('❌ Blockchain reward error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get wallet balance
   */
  async getBalance() {
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }
}

// Export singleton - only initialize if blockchain is enabled
let simpleBlockchainInstance = null;

export const simpleBlockchain = {
  get instance() {
    if (!simpleBlockchainInstance) {
      // Check if blockchain is enabled
      if (process.env.BLOCKCHAIN_ENABLED !== 'true') {
        console.log('ℹ️  Blockchain integration disabled (BLOCKCHAIN_ENABLED=false)');
        return null;
      }
      
      try {
        simpleBlockchainInstance = new SimpleBlockchain();
      } catch (error) {
        console.error('⚠️  Failed to initialize blockchain service:', error.message);
        console.log('ℹ️  Server will continue without blockchain integration');
        return null;
      }
    }
    return simpleBlockchainInstance;
  },
  
  // Proxy methods
  createProofHash(data) {
    return this.instance ? this.instance.createProofHash(data) : null;
  },
  
  async storeProof(proofHash, metadata) {
    if (!this.instance) {
      return { success: false, error: 'Blockchain not initialized' };
    }
    return this.instance.storeProof(proofHash, metadata);
  },
  
  async verifyProof(transactionHash) {
    if (!this.instance) {
      return { verified: false, error: 'Blockchain not initialized' };
    }
    return this.instance.verifyProof(transactionHash);
  },
  
  async getBalance() {
    if (!this.instance) {
      return '0';
    }
    return this.instance.getBalance();
  }
};

