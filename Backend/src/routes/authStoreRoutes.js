const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const userService = require('../services/userService');
const { createJWT } = require('../utils/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const result = await userService.signUp(email, password, name, 'entrepreneur');

    if (!result.success) {
      return res.status(400).json({ message: result.message || 'Registration failed' });
    }

    return res.status(201).json(result.user.getPublicProfile());
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await userService.signIn(email, password);

    if (!result.success) {
      return res.status(401).json({ message: result.message || 'Invalid credentials' });
    }

    const user = result.user;
    const role = user.userRole || 'entrepreneur';

    const token = createJWT({
      userId: user._id,
      id: user._id,
      email: user.email,
      userRole: role,
      role,
    });

    await userService.updateLastLogin(user._id);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
        role,
      },
    });
  } catch (err) {
    return res.status(401).json({ message: err.message || 'Invalid credentials' });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  return res.json({
    id: req.user.id,
    name: req.user.name || req.user.fullName || 'User',
    email: req.user.email,
    role: req.user.role || req.user.userRole || 'entrepreneur',
  });
});

module.exports = router;
