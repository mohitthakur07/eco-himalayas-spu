import { Home, ShoppingBag, Gift, Trophy, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Gift, path: '/rewards', label: 'Rewards' },
    { icon: Trophy, path: '/leaderboard', label: 'Rank' },
    { icon: ShoppingBag, path: '/shop', label: 'Shop' },
    { icon: BookOpen, path: '/guide', label: 'Guide' },
  ]

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="max-w-md lg:max-w-3xl mx-auto bg-white/70 backdrop-blur-sm shadow-lg rounded-3xl border border-white/20 flex justify-around items-center py-3 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive 
                  ? 'text-gray-900' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              onClick={() => navigate(item.path)}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${
                isActive 
                  ? 'bg-gray-900 text-white scale-110' 
                  : 'bg-transparent'
              }`}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav

