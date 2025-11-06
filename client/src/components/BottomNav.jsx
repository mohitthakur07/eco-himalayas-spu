import { Home, ShoppingBag, Gift, Trophy, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: Trophy, path: '/leaderboard', label: 'Leaderboard' },
    { icon: Gift, path: '/rewards', label: 'Rewards' },
    { icon: ShoppingBag, path: '/shop', label: 'Shop' },
    { icon: BookOpen, path: '/guide', label: 'Guide' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-md mx-auto flex justify-around items-center py-2.5 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <button
              key={item.path}
              className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => navigate(item.path)}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default BottomNav

