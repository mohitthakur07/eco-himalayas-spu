import { useState, useEffect, useRef } from 'react';
import { X, Timer, Trophy, TrendingUp, Zap, PackageCheck } from 'lucide-react';
import { arenaService } from '../services/arenaService';
import { authService } from '../services/authService';

const ArenaWindow = () => {
  const [session, setSession] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [deposits, setDeposits] = useState([]);
  const [totalRewards, setTotalRewards] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [latestDeposit, setLatestDeposit] = useState(null);
  const timerRef = useRef(null);
  const userId = authService.getCurrentUser()?.userId;

  useEffect(() => {
    if (!userId) return;

    // Connect to WebSocket
    arenaService.connect();
    arenaService.joinArena(userId, 'pending');

    // Check for existing active session
    checkActiveSession();

    // Listen for arena started event
    arenaService.onArenaStarted((data) => {
      console.log('🎮 Arena started:', data);
      setSession(data);
      setRemainingTime(data.duration);
      setIsVisible(true);
      setDeposits([]);
      setTotalRewards(0);
    });

    // Listen for deposit events
    arenaService.onDepositRecorded((data) => {
      console.log('🗑️  Deposit recorded:', data);
      setLatestDeposit(data);
      setDeposits(prev => [...prev, data]);
      setTotalRewards(data.totalRewards);
      setRemainingTime(data.remainingTime);

      // Clear latest deposit after animation
      setTimeout(() => setLatestDeposit(null), 3000);
    });

    return () => {
      arenaService.removeAllListeners();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [userId]);

  // Check for active session on mount
  const checkActiveSession = async () => {
    try {
      const result = await arenaService.getActiveSession();
      if (result.hasActiveSession) {
        setSession(result.session);
        setRemainingTime(result.session.remainingTime);
        setTotalRewards(result.session.totalRewards);
        setDeposits(result.session.deposits || []);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check session:', error);
    }
  };

  // Timer countdown
  useEffect(() => {
    if (!session || remainingTime <= 0) return;

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session]);

  const handleSessionEnd = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Session ended - show summary briefly then close
    setTimeout(async () => {
      try {
        await arenaService.exitSession();
      } catch (error) {
        console.error('Exit error:', error);
      }
      handleClose();
    }, 3000);
  };

  const handleClose = async () => {
    try {
      if (remainingTime > 0) {
        // User manually exited
        await arenaService.exitSession();
      }
      
      if (userId) {
        arenaService.leaveArena(userId);
      }
      
      setIsVisible(false);
      setSession(null);
      setDeposits([]);
      setTotalRewards(0);
      setRemainingTime(0);
    } catch (error) {
      console.error('Close error:', error);
      setIsVisible(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (totalRewards / 100) * 100;
  };

  const getTimePercentage = () => {
    return (remainingTime / 600) * 100;
  };

  if (!isVisible || !session) return null;

  const isExpired = remainingTime <= 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-[60]">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border-4 border-primary-500 animate-pulse-slow">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-lg"
        >
          <X size={24} className="text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl animate-bounce">
            <Trophy size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {isExpired ? '⏰ Session Ended!' : '🎮 Arena Mode Active!'}
          </h2>
          <p className="text-sm text-gray-700 font-medium">
            {isExpired ? 'Great job! Here\'s your summary:' : 'Dispose waste to earn rewards!'}
          </p>
        </div>

        {/* Timer */}
        {!isExpired && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Timer size={20} className="text-primary-600" />
                <span className="text-sm font-semibold text-gray-600">Time Remaining</span>
              </div>
              <span className="text-3xl font-bold text-primary-600">{formatTime(remainingTime)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000"
                style={{ width: `${getTimePercentage()}%` }}
              />
            </div>
          </div>
        )}

        {/* Rewards Progress */}
        <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-yellow-600" />
              <span className="text-sm font-semibold text-gray-600">Total Rewards</span>
            </div>
            <span className="text-3xl font-bold text-yellow-600">{totalRewards}/100</span>
          </div>
          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {100 - totalRewards} coins remaining
          </p>
        </div>

        {/* Latest Deposit Animation */}
        {latestDeposit && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-4 mb-4 shadow-xl animate-bounce">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Zap size={24} />
                <span className="font-bold">New Deposit!</span>
              </div>
              <span className="text-2xl font-bold">+{latestDeposit.reward} 🎉</span>
            </div>
          </div>
        )}

        {/* Deposits List */}
        {deposits.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-lg max-h-40 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3">
              <PackageCheck size={18} className="text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Deposits ({deposits.length})</span>
            </div>
            <div className="space-y-2">
              {deposits.slice().reverse().map((deposit, index) => (
                <div key={index} className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600">Deposit #{deposits.length - index}</span>
                  <span className="font-bold text-primary-600">+{deposit.reward} coins</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!isExpired && deposits.length === 0 && (
          <div className="bg-blue-50 rounded-xl p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">
              💡 Open the garbage box to start earning rewards!
            </p>
          </div>
        )}

        {/* Session Ended Message */}
        {isExpired && (
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl p-4 text-center text-white mt-4">
            <p className="font-bold text-lg">🎊 Session Complete!</p>
            <p className="text-sm mt-1">Window will close automatically...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArenaWindow;



