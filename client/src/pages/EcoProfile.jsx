import { ArrowLeft, MoreVertical, ArrowRight, Globe, Leaf, Mountain, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import BottomNav from '../components/BottomNav'
import './EcoProfile.css'

const EcoProfile = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('impact')

  const achievements = [
    { label: 'Beginner', active: false },
    { label: 'Eco Warrior', active: true },
    { label: 'Champion', active: false },
  ]

  return (
    <div className="app-container">
      <div className="eco-header">
        <div className="eco-header-content">
          <button className="back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={24} />
          </button>
          <h1 className="page-title">My Impact</h1>
          <button className="more-btn">
            <MoreVertical size={24} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'impact' ? 'active' : ''}`}
            onClick={() => setActiveTab('impact')}
          >
            Impact
          </button>
          <button
            className={`tab ${activeTab === 'badges' ? 'active' : ''}`}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
          <button
            className={`tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Eco Achievement Section */}
        <div className="perfect-fit-section">
          <h3 className="section-title">Your Eco Level</h3>

          {/* Achievement Selector */}
          <div className="size-selector">
            {achievements.map((achievement, index) => (
              <div key={index} className={`size-card ${achievement.active ? 'active' : ''}`}>
                <span className="size-label">{achievement.label}</span>
                {achievement.active && <Check size={20} className="check-mark" />}
              </div>
            ))}
          </div>

          {/* Impact Stats Card */}
          <div className="product-card">
            <div className="product-image-container">
              <div className="product-visual">
                <div className="eco-globe">
                  <Globe size={80} strokeWidth={1.5} />
                </div>
              </div>
            </div>
            
            <div className="product-footer">
              <div className="impact-badge">
                <div className="impact-icon">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="store-name">Environmental Impact</p>
                  <p className="offer-text">15kg CO₂ Saved</p>
                </div>
                <ArrowRight className="arrow-icon" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Eco Guide Section */}
        <div className="article-section">
          <h3 className="section-title">Eco-Tourism Guide</h3>
          <div className="article-card">
            <div className="article-image">
              <div className="eco-icon">
                <Mountain size={32} strokeWidth={2} />
              </div>
            </div>
            <div className="article-content">
              <p className="article-category">Sustainable Travel</p>
              <p className="article-title">Best Practices for Eco-Friendly Trekking in Himachal</p>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default EcoProfile

