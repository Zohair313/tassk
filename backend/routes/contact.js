const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// POST a contact message
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data: contactMessage, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{
        name, email, subject, message, status: 'open'
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'Message sent successfully', contactMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error sending message' });
  }
});

// GET all contact messages (Admin only)
router.get('/', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { data: messages, error } = await supabaseAdmin
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error fetching messages' });
  }
});

// PUT update contact message status (Admin only)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const { data: message, error } = await supabaseAdmin
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error updating message' });
  }
});

module.exports = router;
