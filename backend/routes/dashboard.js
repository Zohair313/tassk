const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// GET user dashboard stats
router.get('/user', requireAuth, async (req, res) => {
  try {
    const { data: domains, error: domainsError } = await supabaseAdmin
      .from('domains')
      .select('id, status')
      .eq('user_id', req.user.id);

    const { data: subscriptions, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('id, status')
      .eq('user_id', req.user.id);

    if (domainsError || subError) throw domainsError || subError;

    const totalDomains = domains.length;
    const activeDomains = domains.filter(d => d.status === 'Active').length;
    const expiringDomains = domains.filter(d => d.status === 'Expiring Soon').length;
    const activeSubscriptions = subscriptions.filter(s => s.status === 'Active').length;

    res.json({
      stats: {
        totalDomains,
        activeDomains,
        expiringDomains,
        activeSubscriptions
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching user stats' });
  }
});

// GET admin dashboard stats
router.get('/admin', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { count: usersCount, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: domainsCount, error: domainsError } = await supabaseAdmin
      .from('domains')
      .select('*', { count: 'exact', head: true });

    const { count: subscriptionsCount, error: subError } = await supabaseAdmin
      .from('user_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (usersError || domainsError || subError) throw usersError || domainsError || subError;

    res.json({
      stats: {
        totalUsers: usersCount,
        totalDomains: domainsCount,
        totalSubscriptions: subscriptionsCount
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching admin stats' });
  }
});

// GET all registered users (Admin only) - user directory
router.get('/admin/users', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: users, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

module.exports = router;
