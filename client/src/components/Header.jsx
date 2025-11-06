import { Bell, Leaf } from 'lucide-react'
import './Header.css'

const Header = ({ userName = "Eco Traveler" }) => {
  return (
    <div className="header">
      <div className="header-content">
        <div className="user-info">
          <div className="avatar">
            <Leaf size={28} strokeWidth={2.5} />
          </div>
          <div className="greeting">
            <span className="greeting-text">Welcome,</span>
            <h2 className="user-name">{userName}</h2>
          </div>
        </div>
        <button className="notification-btn">
          <Bell size={24} />
        </button>
      </div>
    </div>
  )
}

export default Header

