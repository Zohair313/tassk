const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// GET all active hosting plans
router.get('/plans', async (req, res) => {
  try {
    const { data: plans, error } = await supabaseAdmin
      .from('hosting_plans')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    res.json({ plans });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching plans' });
  }
});

// POST subscribe a domain to a hosting plan
router.post('/subscribe', requireAuth, async (req, res) => {
  try {
    const { domain_id, plan_id, next_billing_date } = req.body;
    
    if (!domain_id || !plan_id || !next_billing_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify domain belongs to user
    const { data: domain, error: domainError } = await supabaseAdmin
      .from('domains')
      .select('id')
      .eq('id', domain_id)
      .eq('user_id', req.user.id)
      .single();

    if (domainError || !domain) {
      return res.status(403).json({ error: 'Not authorized for this domain' });
    }

    const { data: subscription, error } = await supabaseAdmin
      .from('user_subscriptions')
      .insert([{
        user_id: req.user.id,
        domain_id,
        plan_id,
        next_billing_date,
        status: 'Active'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ subscription });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error subscribing to plan' });
  }
});

// GET user subscriptions
router.get('/subscriptions', requireAuth, async (req, res) => {
  try {
    let query = supabaseAdmin.from('user_subscriptions').select('*, hosting_plans(*), domains(*)');
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }
    const { data: subscriptions, error } = await query;
    if (error) throw error;
    res.json({ subscriptions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching subscriptions' });
  }
});

// POST create a hosting plan (Admin only)
router.post('/plans', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { plan_name, storage_gb, bandwidth_gb, price_monthly } = req.body;
    if (!plan_name || !storage_gb || !bandwidth_gb || !price_monthly) {
      return res.status(400).json({ error: 'All plan fields are required' });
    }
    const { data: plan, error } = await supabaseAdmin
      .from('hosting_plans')
      .insert([{ plan_name, storage_gb, bandwidth_gb, price_monthly, is_active: true }])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating plan' });
  }
});

// PUT toggle a hosting plan active status (Admin only)
router.put('/plans/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    const { plan_name, storage_gb, bandwidth_gb, price_monthly, is_active } = req.body;

    const updates = {};
    if (plan_name !== undefined) updates.plan_name = plan_name;
    if (storage_gb !== undefined) updates.storage_gb = storage_gb;
    if (bandwidth_gb !== undefined) updates.bandwidth_gb = bandwidth_gb;
    if (price_monthly !== undefined) updates.price_monthly = price_monthly;
    if (is_active !== undefined) updates.is_active = is_active;

    const { data: plan, error } = await supabaseAdmin
      .from('hosting_plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json({ plan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating plan' });
  }
});

// DELETE a hosting plan (Admin only)
router.delete('/plans/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('hosting_plans').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting plan' });
  }
});

module.exports = router;
