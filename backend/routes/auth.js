const express = require('express');
const router = express.Router();
const { supabase, supabaseAdmin } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Never trust client-supplied role. Force new accounts to 'user'.
    const role = 'user';

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    if (!authData || !authData.user) {
      return res.status(400).json({ error: 'User already exists or registration failed.' });
    }

    // Supabase returns a fake user with an empty identities array if the user already exists
    if (authData.user?.identities?.length === 0) {
      return res.status(400).json({ error: 'Email is already registered. Please sign in.' });
    }

    // Insert profile using the admin client to bypass RLS,
    // because signUp might not return a session if email confirmation is enabled.
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([
        { id: authData.user.id, email: authData.user.email, role }
      ])
      .select('id, email, role')
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return res.status(500).json({ error: 'User registered but failed to create profile.' });
    }

    res.status(201).json({ 
      user: profileData, 
      access_token: authData.session?.access_token || 'Please check email to confirm (if email confirmations enabled)' 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Log in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user profile (admin client bypasses RLS)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      user: profile,
      access_token: authData.session.access_token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// GET ME
router.get('/me', requireAuth, async (req, res) => {
  try {
    // req.user is set by requireAuth middleware
    const { data: user, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
