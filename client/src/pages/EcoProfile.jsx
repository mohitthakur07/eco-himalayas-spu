import { ArrowRight, Globe, Leaf, Mountain, Check, Recycle, Droplet } from 'lucide-react'
import { useState } from 'react'
import Header from '../components/Header'
import BottomNav from '../components/BottomNav'

const EcoProfile = () => {
  const [activeTab, setActiveTab] = useState('impact')

  const achievements = [
    { label: 'Beginner', level: 1, active: false },
    { label: 'Eco Warrior', level: 2, active: true },
    { label: 'Champion', level: 3, active: false },
  ]

  const impactStats = [
    { icon: Recycle, label: 'CO₂ Saved', value: '125 kg', color: 'from-green-400 to-emerald-500' },
    { icon: Droplet, label: 'Water Saved', value: '450 L', color: 'from-blue-400 to-cyan-500' },
    { icon: Leaf, label: 'Trees Planted', value: '12', color: 'from-teal-400 to-green-500' },
  ]

  const recentActions = [
    { action: 'Waste Disposal', location: 'Manali Trek Point', points: 50, date: '2 hours ago' },
    { action: 'Water Conservation', location: 'Rohtang Pass', points: 30, date: '1 day ago' },
    { action: 'Local Support', location: 'Green Cafe', points: 40, date: '2 days ago' },
  ]

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Tabs */}
        <div className="flex gap-2.5 md:gap-4 mb-5 bg-white p-1.5 md:p-2 rounded-[25px] md:rounded-[30px]">
          <button
            className={`flex-1 px-5 py-3 rounded-[20px] text-sm font-medium transition-all ${
              activeTab === 'impact'
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('impact')}
          >
            Impact
          </button>
          <button
            className={`flex-1 px-5 py-3 rounded-[20px] text-sm font-medium transition-all ${
              activeTab === 'badges'
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('badges')}
          >
            Badges
          </button>
          <button
            className={`flex-1 px-5 py-3 rounded-[20px] text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-primary-500 text-white'
                : 'bg-transparent text-gray-900 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
        </div>

        {/* Impact Tab */}
        {activeTab === 'impact' && (
          <>
            {/* Eco Level Section */}
            <div className="mb-5">
              <h3 className="section-title">Your Eco Level</h3>

              {/* Achievement Selector */}
              <div className="flex gap-2.5 mb-5">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`flex-1 bg-white border-2 rounded-[15px] p-4 text-center cursor-pointer relative transition-all ${
                      achievement.active
                        ? 'border-primary-500 bg-gradient-to-br from-blue-50 to-cyan-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-gray-900">{achievement.label}</span>
                    {achievement.active && (
                      <Check size={20} className="absolute top-1.5 right-1.5 text-primary-500" />
                    )}
                  </div>
                ))}
              </div>

              {/* Impact Globe Card */}
              <div className="bg-white rounded-[20px] overflow-hidden shadow-md mb-5">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-10 flex items-center justify-center min-h-[250px] relative">
                  <div className="w-full h-[200px] bg-gradient-to-br from-pink-200 to-pink-300 rounded-[20px] flex items-center justify-center shadow-lg">
                    <Globe size={80} strokeWidth={1.5} className="text-primary-500" />
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-[15px] p-4">
                    <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center text-primary-500">
                      <Leaf size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-semibold text-gray-900">Environmental Impact</p>
                      <p className="text-xs text-gray-500">125kg CO₂ Saved</p>
                    </div>
                    <ArrowRight size={20} className="text-gray-900" />
                  </div>
                </div>
              </div>

              {/* Impact Stats Grid */}
              <h3 className="section-title">Your Contributions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {impactStats.map((stat, index) => {
                  const StatIcon = stat.icon
                  return (
                    <div key={index} className="bg-white rounded-[20px] p-5 shadow-sm">
                      <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-full flex items-center justify-center mb-3`}>
                        <StatIcon size={24} className="text-white" strokeWidth={2.5} />
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                      <p className="text-sm text-gray-600">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <h3 className="section-title">Recent Actions</h3>
            <div className="space-y-3">
              {recentActions.map((item, index) => (
                <div key={index} className="bg-white rounded-[15px] p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900">{item.action}</p>
                    <span className="text-sm font-bold text-primary-600">+{item.points} pts</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.location}</p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div>
            <h3 className="section-title">Eco-Tourism Guide</h3>
            <div className="bg-white rounded-[15px] p-4 flex gap-4 shadow-sm">
              <div className="w-[60px] h-[60px] rounded-[10px] bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center flex-shrink-0">
                <Mountain size={32} strokeWidth={2} className="text-primary-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Sustainable Travel</p>
                <p className="text-sm font-semibold text-gray-900 leading-tight">Best Practices for Eco-Friendly Trekking in Himachal</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export default EcoProfile

