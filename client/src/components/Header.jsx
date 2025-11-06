import { useState, useEffect } from 'react'
import { Bell, Leaf, LogIn, LogOut } from 'lucide-react'
import { authService } from '../services/authService'
import AuthModal from './AuthModal'
import './Header.css'

const Header = ({ userName }) => {
  const [user, setUser] = useState(null)
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const currentUser = authService.getCurrentUser()
    setUser(currentUser)
  }, [])

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    window.location.reload()
  }

  const displayName = userName || user?.username || "Eco Traveler"

  return (
    <>
      <div className="header">
        <div className="header-content">
          <div className="user-info">
            <div className="avatar">
              <Leaf size={28} strokeWidth={2.5} />
            </div>
            <div className="greeting">
              <span className="greeting-text">Welcome,</span>
              <h2 className="user-name">{displayName}</h2>
            </div>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={24} />
            </button>
            {user ? (
              <button className="auth-btn" onClick={handleLogout} title="Logout">
                <LogOut size={20} />
              </button>
            ) : (
              <button className="auth-btn login" onClick={() => setShowAuthModal(true)} title="Login">
                <LogIn size={20} />
              </button>
            )}
          </div>
        </div>
      </div>

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setUser(authService.getCurrentUser())}
        />
      )}
    </>
  )
}

export default Header

