import { ethers } from 'ethers';

class SimpleWeb3 {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }
  
  /**
   * Check if user is on mobile device
   */
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  /**
   * Get MetaMask deep link for mobile
   */
  getMobileDeepLink() {
    const currentUrl = window.location.href;
    // Remove protocol and create MetaMask deep link
    const dappUrl = currentUrl.replace(/^https?:\/\//, '');
    return `https://metamask.app.link/dapp/${dappUrl}`;
  }
  
  /**
   * Connect MetaMask wallet
   */
  async connectWallet() {
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum === 'undefined') {
        // Mobile device - provide deep link to MetaMask app
        if (this.isMobile()) {
          const deepLink = this.getMobileDeepLink();
          return {
            success: false,
            error: 'MOBILE_NO_METAMASK',
            deepLink: deepLink,
            message: 'Please open this page in MetaMask mobile app browser'
          };
        }
        
        // Desktop - show install instructions
        return {
          success: false,
          error: 'Please install MetaMask extension first!\nVisit: https://metamask.io'
        };
      }
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      // Create provider (ethers.js v6)
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.address = accounts[0];
      
      console.log('✅ Wallet connected:', this.address);
      
      return {
        success: true,
        address: this.address,
        shortAddress: this.address.slice(0, 6) + '...' + this.address.slice(-4)
      };
    } catch (error) {
      console.error('❌ Connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Disconnect wallet
   */
  disconnect() {
    this.provider = null;
    this.signer = null;
    this.address = null;
  }
  
  /**
   * Check if connected
   */
  isConnected() {
    return this.address !== null;
  }
  
  /**
   * Get current address
   */
  getAddress() {
    return this.address;
  }
  
  /**
   * Get short address for display
   */
  getShortAddress() {
    if (!this.address) return '';
    return this.address.slice(0, 6) + '...' + this.address.slice(-4);
  }
}

// Export singleton
export const simpleWeb3 = new SimpleWeb3();

