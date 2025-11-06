import { ArrowLeft, MoreVertical, ArrowRight, Hotel, Utensils, Backpack, MapPin, Leaf, Gift, Award } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './Rewards.css'

const Rewards = () => {
  const navigate = useNavigate()

  const stores = [
    { name: 'All', active: true },
    { name: 'Hotels', icon: Hotel, active: false },
    { name: 'Food', icon: Utensils, active: false },
    { name: 'Activities', icon: MapPin, active: false },
  ]

  const offers = [
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Eco-Friendly Hotel Stay',
      image: Hotel,
      discount: '20% OFF',
      points: 100,
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Organic Local Food',
      image: Utensils,
      discount: '15% OFF',
      points: 50,
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Sustainable Trek Gear',
      image: Backpack,
      discount: '25% OFF',
      points: 80,
    },
    {
      store: 'Green Stamp',
      icon: Leaf,
      product: 'Eco-Tour Package',
      image: MapPin,
      discount: '30% OFF',
      points: 150,
    },
  ]

  return (
    <div className="app-container">
      <div className="rewards-header">
        <div className="rewards-header-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="page-title">Rewards</h1>
          <button className="more-btn">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Eco Points Balance Card */}
        <div className="balance-card">
          <div className="balance-header">
            <div>
              <p className="balance-label">Eco Points</p>
              <h1 className="balance-amount">
                <Leaf size={32} strokeWidth={2.5} style={{ marginRight: '8px' }} />
                250
              </h1>
            </div>
            <button className="gift-btn">
              <Gift size={24} />
            </button>
          </div>
          <button className="rewards-link">
            View Green Stamp Rewards <ArrowRight size={16} />
          </button>
        </div>

        {/* Category Filter */}
        <div className="store-section">
          <h3 className="section-title">Green Stamp Partners</h3>
          <div className="store-filters">
            {stores.map((store, index) => {
              const StoreIcon = store.icon
              return (
                <button
                  key={index}
                  className={`store-btn ${store.active ? 'active' : ''}`}
                >
                  {StoreIcon && <StoreIcon size={18} className="store-logo" />}
                  {store.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Offers */}
        <div className="offers-section">
          {offers.map((offer, index) => {
            const OfferImage = offer.image
            const OfferIcon = offer.icon
            return (
              <div key={index} className="offer-card">
                <div className="offer-image">
                  <div className="product-image">
                    <OfferImage size={64} strokeWidth={1.5} />
                  </div>
                  <div className="points-badge">
                    <Award size={16} />
                    <span className="points">{offer.points}</span>
                  </div>
                </div>
                <div className="offer-info">
                  <div className="store-badge">
                    <div className="store-icon">
                      <OfferIcon size={20} />
                    </div>
                    <div>
                      <p className="store-name">{offer.store}</p>
                      <p className="offer-text">Digital Offer {offer.discount}</p>
                    </div>
                    <ArrowRight className="arrow-icon" size={20} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Rewards

