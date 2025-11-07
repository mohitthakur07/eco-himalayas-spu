import { useState } from 'react';
import { Wallet, ArrowRight, ExternalLink, CheckCircle, XCircle, Loader } from 'lucide-react';

export default function TransferToWallet({ user, onTransferComplete }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const handleTransfer = async () => {
    if (!user.walletAddress) {
      setError('Please connect your wallet first');
      return;
    }

    if (user.ecoBalance <= 0) {
      setError('You need eco-coins to transfer');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_BASE}/api/arena/transfer-to-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}) // Transfer all coins
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Transfer failed');
      }

      setSuccess(data.transaction);
      if (onTransferComplete) {
        onTransferComplete();
      }

    } catch (err) {
      setError(err.message || 'Failed to transfer to wallet');
    } finally {
      setLoading(false);
    }
  };

  if (!user.walletAddress) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Wallet className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Connect Wallet to Enable Transfers</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Link your MetaMask wallet to transfer eco-coins to cryptocurrency.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Wallet className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Transfer to Crypto Wallet</h2>
          <p className="text-sm text-gray-600">Convert your eco-coins to POL tokens</p>
        </div>
      </div>

      {/* Balance Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="text-2xl font-bold text-green-600">{user.ecoBalance}</span>
        </div>
        <div className="flex justify-center items-center gap-2 text-sm text-gray-500 my-3">
          <span>{user.ecoBalance} Eco-Coins</span>
          <ArrowRight className="w-4 h-4" />
          <span>{(user.ecoBalance * 0.000000000000000001).toFixed(18)} POL</span>
        </div>
        <div className="text-xs text-gray-500 text-center">
          1 eco-coin = 1 wei = 0.000000000000000001 POL
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <div className="text-xs text-blue-600 font-medium mb-1">Connected Wallet</div>
        <div className="text-sm text-blue-900 font-mono break-all">
          {user.walletAddress}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-green-900">Transfer Successful!</div>
              <div className="text-sm text-green-700 mt-1">
                {success.amount} eco-coins transferred to your wallet
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">POL Received:</span>
              <span className="font-medium">{success.polAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">New Balance:</span>
              <span className="font-medium text-green-600">{success.newBalance} eco-coins</span>
            </div>
          </div>

          <a
            href={success.explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            View on Polygon Scan
          </a>
        </div>
      )}

      {/* Transfer Button */}
      <button
        onClick={handleTransfer}
        disabled={loading || user.ecoBalance <= 0 || !!success}
        className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
          loading || user.ecoBalance <= 0 || success
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800'
        }`}
      >
        {loading ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Processing Transfer...
          </>
        ) : success ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Transfer Complete
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Transfer All to Wallet
          </>
        )}
      </button>

      {user.ecoBalance <= 0 && !success && (
        <p className="text-sm text-gray-500 text-center mt-3">
          Earn eco-coins by depositing waste to transfer to your wallet
        </p>
      )}

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="text-xs text-blue-900 space-y-1">
          <div className="font-semibold mb-1">💡 How it works:</div>
          <div>1. Deposit waste → Earn eco-coins in app</div>
          <div>2. Accumulate coins over time</div>
          <div>3. Transfer to wallet → Receive real POL tokens</div>
          <div>4. Transaction recorded on blockchain</div>
        </div>
      </div>
    </div>
  );
}

