import { useState, useEffect } from 'react'
import { Leaf, Gift, QrCode, Zap, Sparkles } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import QRGenerator from '../components/QRGenerator'
import { authService } from '../services/authService'
import { userService } from '../services/userService'

const Home = () => {
  const rewardStars = Array(10).fill(0)
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showQRGenerator, setShowQRGenerator] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const currentUser = authService.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
        const balanceData = await userService.getBalance()
        setBalance(balanceData.balance)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQRGenerated = () => {
    loadUserData() // Refresh balance after QR generation
  }

  const handleGenerateClick = () => {
    if (!authService.isAuthenticated()) {
      alert('Please login to generate QR codes')
      return
    }
    setShowQRGenerator(true)
  }

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Hero QR Scanner Section */}
        <div className="mb-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-xs font-semibold mb-3">
              <Zap size={16} strokeWidth={2.5} />
              <span>Instant Rewards</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generate QR codes and earn surprise eco-coins!</h2>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-green-100 rounded-3xl p-8 text-center shadow-lg">
            <div className="relative mb-6">
              <div className="w-28 h-28 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-md">
                <QrCode size={80} strokeWidth={1.5} className="text-primary-600" />
              </div>
            </div>

            <button 
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95 mb-3"
              onClick={handleGenerateClick}
            >
              <Sparkles size={22} strokeWidth={2.5} />
              Generate & Earn
            </button>

            <p className="text-sm text-gray-600 font-medium">Get 5-60 eco-coins per QR code!</p>
          </div>
        </div>

        {/* Eco Points Balance Card */}
        <div className="bg-white rounded-3xl p-6 shadow-lg mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Eco Points</p>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Leaf size={32} strokeWidth={2.5} className="text-primary-500 mr-2" />
                {loading ? '...' : balance}
              </h1>
            </div>
            <button className="w-12 h-12 bg-yellow-50 hover:bg-yellow-100 rounded-full flex items-center justify-center transition-colors">
              <Gift size={24} className="text-yellow-600" />
            </button>
          </div>
        </div>
      </div>

      <BottomNav />

      {showQRGenerator && (
        <QRGenerator 
          onClose={() => setShowQRGenerator(false)}
          onGenerated={handleQRGenerated}
        />
      )}
    </div>
  )
}

export default Home

