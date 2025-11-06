import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, MapPin, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';
import { authService } from '../services/authService';
import { leaderboardService } from '../services/leaderboardService';

const Leaderboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('global');
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [stateLeaderboard, setStateLeaderboard] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districtLeaderboard, setDistrictLeaderboard] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  useEffect(() => {
    if (selectedDistrict && activeTab === 'district') {
      loadDistrictLeaderboard(selectedDistrict);
    }
  }, [selectedDistrict, activeTab]);

  const loadLeaderboards = async () => {
    try {
      // Load global leaderboard
      const globalData = await leaderboardService.getGlobalLeaderboard();
      setGlobalLeaderboard(globalData.leaderboard || []);

      // Load state leaderboard (Himachal Pradesh)
      const stateData = await leaderboardService.getStateLeaderboard('Himachal Pradesh');
      setStateLeaderboard(stateData.leaderboard || []);

      // Load districts list
      const districtsData = await leaderboardService.getDistricts();
      setDistricts(districtsData.districts || []);
      
      // Set first district as default and load its data
      if (districtsData.districts && districtsData.districts.length > 0) {
        const firstDistrict = districtsData.districts[0];
        setSelectedDistrict(firstDistrict);
        
        // Load first district's leaderboard immediately
        const districtData = await leaderboardService.getDistrictLeaderboard(firstDistrict);
        setDistrictLeaderboard(districtData.leaderboard || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistrictLeaderboard = async (district) => {
    try {
      const districtData = await leaderboardService.getDistrictLeaderboard(district);
      setDistrictLeaderboard(districtData.leaderboard || []);
    } catch (error) {
      console.error('Failed to load district leaderboard:', error);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy size={24} className="text-yellow-500 drop-shadow-lg" />;
    if (rank === 2) return <Medal size={24} className="text-gray-400 drop-shadow-lg" />;
    if (rank === 3) return <Award size={24} className="text-orange-600 drop-shadow-lg" />;
    return <span className="text-lg font-bold text-gray-400">{rank}</span>;
  };

  return (
    <div className="app-container">
      <Header />

      <div className="page-content">
        {/* Tabs */}
        <div className="flex gap-2 mb-5 bg-gray-100 p-1.5 rounded-[20px]">
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[15px] font-semibold text-sm transition-all ${
              activeTab === 'global'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('global')}
          >
            <TrendingUp size={16} />
            <span>Global</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[15px] font-semibold text-sm transition-all ${
              activeTab === 'state'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('state')}
          >
            <MapPin size={16} />
            <span>State</span>
          </button>
          <button
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-[15px] font-semibold text-sm transition-all ${
              activeTab === 'district'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('district')}
          >
            <Users size={16} />
            <span>District</span>
          </button>
        </div>

        {/* District Selector (only show when district tab is active) */}
        {activeTab === 'district' && districts.length > 0 && (
          <div className="mb-5">
            <select
              id="district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-[15px] font-medium text-gray-700 focus:border-primary-500 focus:outline-none transition-colors"
            >
              {districts.map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>
        )}

        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Top Users Globally</h2>
              <TrendingUp size={20} className="text-primary-500" />
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {globalLeaderboard.map((user) => (
                  <div key={user.username} className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{user.username}</div>
                      <div className="text-xs text-gray-500 truncate">{user.district}, {user.state}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-primary-600 text-lg">{user.ecoBalance}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">credits</div>
                    </div>
                  </div>
                ))}
                {globalLeaderboard.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No users found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* State Leaderboard */}
        {activeTab === 'state' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Himachal Pradesh</h2>
              <MapPin size={20} className="text-primary-500" />
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {stateLeaderboard.map((user) => (
                  <div key={user.username} className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{user.username}</div>
                      <div className="text-xs text-gray-500 truncate">{user.district}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-primary-600 text-lg">{user.ecoBalance}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">credits</div>
                    </div>
                  </div>
                ))}
                {stateLeaderboard.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No users found</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* District Leaderboard */}
        {activeTab === 'district' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">{selectedDistrict || 'District'}</h2>
              <Users size={20} className="text-primary-500" />
            </div>

            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-3">
                {districtLeaderboard.map((user) => (
                  <div key={user.username} className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 flex items-center justify-center flex-shrink-0">
                      {getRankIcon(user.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm truncate">{user.username}</div>
                      <div className="text-xs text-gray-500 truncate">{user.district}</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-primary-600 text-lg">{user.ecoBalance}</div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">credits</div>
                    </div>
                  </div>
                ))}
                {districtLeaderboard.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No users found in this district</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
