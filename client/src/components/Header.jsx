import { useState, useEffect } from 'react'
import { Bell, Leaf, LogIn, LogOut, Wallet } from 'lucide-react'
import { authService } from '../services/authService'
import { simpleWeb3 } from '../services/simpleWeb3'
import AuthModal from './AuthModal'

const Header = ({ userName }) => {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [connecting, setConnecting] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    window.location.reload()
  }

  const handleConnectWallet = async () => {
    setConnecting(true)
    const result = await simpleWeb3.connectWallet()
    
    if (result.success) {
      setWalletAddress(result.shortAddress)
      
      // Save to backend
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const token = localStorage.getItem('token')
      
      if (token) {
        try {
          await fetch(`${API_BASE}/api/users/link-wallet`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              walletAddress: result.address
            })
          })
          console.log('✅ Wallet linked to account')
        } catch (error) {
          console.error('Failed to link wallet:', error)
        }
      }
    } else {
      // Handle mobile-specific error
      if (result.error === 'MOBILE_NO_METAMASK') {
        const openInApp = window.confirm(
          '📱 Mobile Detected!\n\n' +
          'To connect your wallet on mobile:\n\n' +
          '1. Install MetaMask mobile app\n' +
          '2. Open this page in MetaMask app browser\n\n' +
          'Click OK to open in MetaMask app now'
        )
        
        if (openInApp && result.deepLink) {
          // Redirect to MetaMask app
          window.location.href = result.deepLink
        }
      } else {
        alert(result.error)
      }
    }
    
    setConnecting(false)
  }

  const displayName = userName || user?.username || "Eco Traveler"

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-[28rem] md:max-w-full mx-auto px-5 md:px-10 lg:px-16 xl:px-20 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white shadow-lg">
              <Leaf size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">Welcome,</span>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{displayName}</h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600">
              <Bell size={20} />
            </button>
            {user && (
              <button
                onClick={handleConnectWallet}
                disabled={connecting}
                title={walletAddress ? `Connected: ${walletAddress}` : 'Connect Wallet'}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-full text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <Wallet size={16} />
                <span className="hidden sm:inline">{walletAddress || (connecting ? 'Connecting...' : 'Connect')}</span>
              </button>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors text-red-600"
              >
                <LogOut size={20} />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                title="Login"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-primary-50 transition-colors text-primary-600"
              >
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setUser(authService.getCurrentUser())}
        />
      )}
    </>
  )
}

export default Header

