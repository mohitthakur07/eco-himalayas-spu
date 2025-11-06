import { useState, useEffect } from 'react'
import { ArrowRight, Hotel, Utensils, Backpack, MapPin, Leaf, Award, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import QRGenerator from '../components/QRGenerator'
import { userService } from '../services/userService'
import { rewardService } from '../services/rewardService'
import { authService } from '../services/authService'

const Rewards = () => {
  const navigate = useNavigate()
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [showQRGenerator, setShowQRGenerator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      if (authService.isAuthenticated()) {
        const balanceData = await userService.getBalance()
        setBalance(balanceData.balance)
        
        const historyData = await rewardService.getHistory()
        setTransactions(historyData.transactions)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQRGenerated = () => {
    loadData()
  }

  const stores = [
    { name: 'All', icon: null },
    { name: 'Hotels', icon: Hotel },
    { name: 'Food', icon: Utensils },
    { name: 'Activities', icon: MapPin },
  ]

  const offers = [
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Eco-Friendly Hotel Stay',
      image: Hotel,
      discount: '20% OFF',
      points: 100,
      category: 'Hotels',
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Organic Local Food',
      image: Utensils,
      discount: '15% OFF',
      points: 50,
      category: 'Food',
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Sustainable Trek Gear',
      image: Backpack,
      discount: '25% OFF',
      points: 80,
      category: 'Activities',
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Eco-Tour Package',
      image: MapPin,
      discount: '30% OFF',
      points: 150,
      category: 'Activities',
    },
  ]

  const filteredOffers = activeCategory === 'All'
    ? offers
    : offers.filter(offer => offer.category === activeCategory)

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Eco Points Balance Card */}
        <div className="balance-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-primary-700 font-medium mb-1">Eco Points</p>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-2">
                <Leaf size={32} strokeWidth={2.5} className="text-primary-500" />
                {loading ? '...' : balance}
              </h1>
            </div>
            <button
              onClick={() => setShowQRGenerator(true)}
              className="w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Plus size={24} className="text-primary-600" />
            </button>
          </div>
          <button
            onClick={() => setShowQRGenerator(true)}
            className="text-sm text-primary-700 font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            Generate QR Code <ArrowRight size={16} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="mb-5 md:mb-7">
          <h3 className="section-title">Green Stamp Partners</h3>
          <div className="flex gap-2.5 overflow-x-auto pb-2.5 scrollbar-hide">
            {stores.map((store, index) => {
              const StoreIcon = store.icon
              const isActive = activeCategory === store.name
              return (
                <button
                  key={index}
                  onClick={() => setActiveCategory(store.name)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-[25px] text-sm font-medium whitespace-nowrap transition-all border-2 ${
                    isActive
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {StoreIcon && <StoreIcon size={18} />}
                  {store.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Offers Grid */}
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8 xl:grid-cols-4 xl:gap-10">
          {filteredOffers.map((offer, index) => {
            const OfferImage = offer.image
            const OfferIcon = offer.icon
            return (
              <div key={index} className="bg-white rounded-[20px] overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {/* Offer Image */}
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center relative min-h-[200px]">
                  <div className="text-primary-500">
                    <OfferImage size={64} strokeWidth={1.5} />
                  </div>
                  <div className="absolute bottom-5 left-5 bg-white rounded-[20px] px-4 py-2 flex items-center gap-1.5 shadow-md">
                    <Award size={16} className="text-primary-500" />
                    <span className="font-semibold text-sm text-gray-900">{offer.points}</span>
                  </div>
                </div>

                {/* Offer Info */}
                <div className="p-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-[15px] p-4">
                    <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center text-primary-500 flex-shrink-0">
                      <OfferIcon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">{offer.store}</p>
                      <p className="text-xs text-gray-500 truncate">Digital Offer {offer.discount}</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-900 flex-shrink-0" />
                  </div>
                </div>
              </div>
            )
          })}
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

export default Rewards

