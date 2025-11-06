import { Home, ShoppingBag, Gift, MapPin, BookOpen } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { icon: Home, path: '/', label: 'Home' },
    { icon: MapPin, path: '/explore', label: 'Explore' },
    { icon: Gift, path: '/rewards', label: 'Rewards' },
    { icon: ShoppingBag, path: '/shop', label: 'Shop' },
    { icon: BookOpen, path: '/guide', label: 'Guide' },
  ]

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.path
        return (
          <button
            key={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <Icon size={24} />
          </button>
        )
      })}
    </div>
  )
}

export default BottomNav

