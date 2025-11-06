import { ArrowRight, Leaf, Recycle, TreePine, Droplet, Gift, Star, Award } from 'lucide-react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'
import './Home.css'

const Home = () => {
  const rewardStars = Array(10).fill(0)

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Dashboard Grid for Desktop */}
        <div className="dashboard-grid">
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

          {/* Green Stamp Progress Card */}
          <div className="reward-card">
            <h3 className="reward-title">Earn Green Stamp</h3>
            <p className="reward-subtitle">Complete 10 eco-tasks to get certified</p>

            <div className="stars-container">
              {rewardStars.map((_, index) => (
                <div key={index} className="star">
                  <Star
                    size={24}
                    fill={index < 6 ? 'var(--primary-color)' : 'none'}
                    stroke={index < 6 ? 'var(--primary-color)' : 'var(--text-light)'}
                    strokeWidth={2}
                  />
                </div>
              ))}
            </div>

            <button className="scan-btn">
              <Leaf size={20} />
              Start Task
            </button>
          </div>
        </div>

        {/* Eco Tasks Section */}
        <div className="ecohimalya-section">
          <h3 className="section-title">Eco-Friendly Tasks</h3>

          <div className="ecohimalya-cards">
            <div className="ecohimalya-card waste">
              <div className="card-icon">
                <Recycle size={32} strokeWidth={2} />
              </div>
              <p className="card-label">Waste Management</p>
              <p className="card-question">Properly dispose waste at designated bins</p>
              <div className="card-points">+50 pts</div>
              <ArrowRight className="card-arrow" size={20} />
            </div>

            <div className="ecohimalya-card water">
              <div className="card-icon">
                <Droplet size={32} strokeWidth={2} />
              </div>
              <p className="card-label">Water Conservation</p>
              <p className="card-question">Use refillable bottles during your trek</p>
              <div className="card-points">+30 pts</div>
              <ArrowRight className="card-arrow" size={20} />
            </div>

            <div className="ecohimalya-card green">
              <div className="card-icon">
                <Award size={32} strokeWidth={2} />
              </div>
              <p className="card-label">Support Local</p>
              <p className="card-question">Shop at Green Stamp certified businesses</p>
              <div className="card-points">+40 pts</div>
              <ArrowRight className="card-arrow" size={20} />
            </div>

            <div className="ecohimalya-card forest">
              <div className="card-icon">
                <TreePine size={32} strokeWidth={2} />
              </div>
              <p className="card-label">Trail Respect</p>
              <p className="card-question">Stay on marked paths, protect wildlife</p>
              <div className="card-points">+35 pts</div>
              <ArrowRight className="card-arrow" size={20} />
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

export default Home

