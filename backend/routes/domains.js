const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Cache whether the optional purchase_date column exists (avoid repeated failing queries)
let hasPurchaseDate = null;
async function supportsPurchaseDate() {
  if (hasPurchaseDate !== null) return hasPurchaseDate;
  const { error } = await supabaseAdmin
    .from('domains')
    .select('purchase_date')
    .limit(1);
  hasPurchaseDate = !error;
  return hasPurchaseDate;
}

// GET DNS health / resolution info for a domain (DevOps helper)
router.get('/check', requireAuth, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || typeof name !== 'string' || name.length === 0 || name.length > 255) {
      return res.status(400).json({ error: 'A valid domain name is required' });
    }

    // Normalize: strip protocol/paths, lowercase
    const clean = name
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .split('/')[0]
      .split(':')[0]
      .trim();

    if (!/^([a-z0-9.-]+\.)+[a-z]{2,}$/.test(clean)) {
      return res.status(400).json({ error: 'Invalid domain name format' });
    }

    const resolveAll = async () => {
      const ipv4 = await dns.resolve4(clean).catch(() => []);
      const ipv6 = await dns.resolve6(clean).catch(() => []);
      const ns = await dns.resolveNs(clean).catch(() => []);
      return { ipv4, ipv6, nameservers: ns };
    };

    const started = Date.now();
    let result;
    try {
      result = await resolveAll();
    } catch (e) {
      return res.json({ domain: clean, resolvable: false, error: 'Resolution failed' });
    }

    const reachable = result.ipv4.length > 0 || result.ipv6.length > 0;
    const primaryIp = result.ipv4[0] || result.ipv6[0] || null;

    res.json({
      domain: clean,
      resolvable: reachable,
      latency_ms: Date.now() - started,
      ipv4: result.ipv4,
      ipv6: result.ipv6,
      nameservers: result.nameservers,
      primary_ip: primaryIp,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error running DNS check' });
  }
});

// GET all domains for logged in user (or all if admin)
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = supabaseAdmin.from('domains').select('*');
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }
    const { data: domains, error } = await query;
    if (error) throw error;
    res.json({ domains });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching domains' });
  }
});

// POST a new domain
router.post('/', requireAuth, async (req, res) => {
  try {
    const { domain_name, registrar, expiry_date, status = 'Active', purchase_date } = req.body;
    
    if (!domain_name || !registrar || !expiry_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertPayload = {
      user_id: req.user.id,
      domain_name,
      registrar,
      expiry_date,
      status
    };
    if (purchase_date && (await supportsPurchaseDate())) {
      insertPayload.purchase_date = purchase_date;
    }

    const { data: newDomain, error } = await supabaseAdmin
      .from('domains')
      .insert([insertPayload])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ domain: newDomain });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error creating domain' });
  }
});

// PUT update a domain
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { domain_name, registrar, expiry_date, status, purchase_date } = req.body;

    const updatePayload = { domain_name, registrar, expiry_date, status };
    if (purchase_date !== undefined && (await supportsPurchaseDate())) {
      updatePayload.purchase_date = purchase_date;
    }

    let query = supabaseAdmin.from('domains').update(updatePayload).eq('id', id);

    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { data: updatedDomain, error } = await query.select().single();
    if (error) throw error;
    
    if (!updatedDomain) return res.status(404).json({ error: 'Domain not found or unauthorized' });
    
    res.json({ domain: updatedDomain });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating domain' });
  }
});

// DELETE a domain
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = supabaseAdmin.from('domains').delete().eq('id', id);
    if (req.user.role !== 'admin') {
      query = query.eq('user_id', req.user.id);
    }

    const { error } = await query;
    if (error) throw error;
    
    res.json({ message: 'Domain deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error deleting domain' });
  }
});

module.exports = router;
