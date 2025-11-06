import express from 'express';
import User from '../models/User.js';

const router = express.Router();

/**
 * Get global leaderboard
 */
router.get('/global', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select('username ecoBalance country state district')
      .sort({ ecoBalance: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      ecoBalance: user.ecoBalance,
      country: user.country,
      state: user.state,
      district: user.district
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Global leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get state-wise leaderboard
 */
router.get('/state/:state', async (req, res) => {
  try {
    const { state } = req.params;
    
    const users = await User.find({ role: 'user', state })
      .select('username ecoBalance country state district')
      .sort({ ecoBalance: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      ecoBalance: user.ecoBalance,
      country: user.country,
      state: user.state,
      district: user.district
    }));

    res.json({ leaderboard, state });
  } catch (error) {
    console.error('State leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get district-wise leaderboard
 */
router.get('/district/:district', async (req, res) => {
  try {
    const { district } = req.params;
    
    const users = await User.find({ role: 'user', district })
      .select('username ecoBalance country state district')
      .sort({ ecoBalance: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      username: user.username,
      ecoBalance: user.ecoBalance,
      country: user.country,
      state: user.state,
      district: user.district
    }));

    res.json({ leaderboard, district });
  } catch (error) {
    console.error('District leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * Get leaderboard stats (for overview)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalEcoBalance = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: null, total: { $sum: '$ecoBalance' } } }
    ]);

    // District-wise stats
    const districtStats = await User.aggregate([
      { $match: { role: 'user' } },
      { $group: {
        _id: '$district',
        users: { $sum: 1 },
        totalBalance: { $sum: '$ecoBalance' }
      }},
      { $sort: { totalBalance: -1 } }
    ]);

    res.json({
      totalUsers,
      totalEcoBalance: totalEcoBalance[0]?.total || 0,
      districtStats: districtStats.map(stat => ({
        district: stat._id,
        users: stat.users,
        totalBalance: stat.totalBalance
      }))
    });
  } catch (error) {
    console.error('Leaderboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * Get all districts (for dropdown)
 */
router.get('/districts', async (req, res) => {
  try {
    const districts = await User.distinct('district', { role: 'user' });
    res.json({ districts: districts.sort() });
  } catch (error) {
    console.error('Districts fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch districts' });
  }
});

export default router;
