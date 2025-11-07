import { useState, useEffect } from 'react'
import { Gift, QrCode, ArrowRight, Recycle, TreePine, Droplet, Award, Leaf } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import QRGenerator from '../components/QRGenerator'
import TransferToWallet from '../components/TransferToWallet'
import { authService } from '../services/authService'
import { userService } from '../services/userService'

const Home = () => {
  const [user, setUser] = useState(null)
  const [ecoPoints, setEcoPoints] = useState(0)
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
        const profileData = await userService.getProfile()
        setEcoPoints(profileData.user?.ecoBalance || 0)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQRGenerated = () => {
    loadUserData()
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

      {/* Main Content */}
      <div className="page-content">

        {/* QR Scanner Hero Section */}
        <div className="bg-gradient-to-br from-primary-400 via-primary-500 to-emerald-600 rounded-[25px] p-8 mb-5 shadow-xl relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <QrCode size={40} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Scan & Earn Rewards</h2>
            <p className="text-white/90 text-sm md:text-base mb-6">Scan QR codes at eco-friendly locations to collect points</p>

            {/* Scan Button */}
            <button
              onClick={handleGenerateClick}
              className="bg-white text-primary-600 font-bold py-4 px-8 rounded-[15px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-2xl active:scale-95 mx-auto hover:bg-gray-50"
            >
              <QrCode size={24} strokeWidth={2.5} />
              <span className="text-lg">Scan Now</span>
            </button>
          </div>
        </div>

        {/* Eco Points Display */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                <Leaf size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs text-green-700 font-semibold">Eco Points</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : ecoPoints}</p>
            <p className="text-xs text-gray-600 mt-1">Current Balance</p>
          </div>

          {/* Rewards Available */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-[20px] p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                <Gift size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <p className="text-xs text-purple-700 font-semibold">Rewards</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">5</p>
            <p className="text-xs text-gray-600 mt-1">Available to Claim</p>
          </div>
        </div>

        {/* Transfer to Wallet Section */}
        {user && (
          <div className="mb-5">
            <TransferToWallet 
              user={{ ...user, ecoBalance: ecoPoints }} 
              onTransferComplete={loadUserData}
            />
          </div>
        )}

        {/* Eco Tasks Section */}
        <div className="mb-5">
          <h3 className="section-title">Eco-Friendly Tasks</h3>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Task Card 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[20px] p-5 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Recycle size={20} className="text-blue-600" />
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold text-blue-700 mb-1">Waste Management</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Properly dispose waste at designated bins</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-blue-600">+50 pts</span>
                  <ArrowRight size={16} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-[20px] p-5 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Droplet size={20} className="text-pink-600" />
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold text-pink-700 mb-1">Water Conservation</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Use refillable bottles during your trek</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-pink-600">+30 pts</span>
                  <ArrowRight size={16} className="text-pink-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Task Card 3 */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-[20px] p-5 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <Award size={20} className="text-green-600" />
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold text-green-700 mb-1">Support Local</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Shop at Green Stamp certified businesses</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-green-600">+40 pts</span>
                  <ArrowRight size={16} className="text-green-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Task Card 4 */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-[20px] p-5 relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
              <div className="absolute top-3 right-3 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <TreePine size={20} className="text-emerald-600" />
              </div>
              <div className="mt-8">
                <p className="text-sm font-semibold text-emerald-700 mb-1">Trail Respect</p>
                <p className="text-xs text-gray-600 mb-3 line-clamp-2">Stay on marked paths, protect wildlife</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600">+35 pts</span>
                  <ArrowRight size={16} className="text-emerald-600 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
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

