const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbRun } = require('../config/database');
require('dotenv').config();

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { employee_id, password } = req.body;

    // Find user by employee_id
    const user = await dbGet(
      'SELECT * FROM users WHERE employee_id = ?',
      [employee_id]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid employee ID or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Your account is inactive. Please contact administrator.' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid employee ID or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        employee_id: user.employee_id,
        is_admin: user.is_admin,
        is_active: user.is_active,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    // Return user info and token
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        full_name: user.full_name,
        department: user.department,
        position: user.position,
        email: user.email,
        is_admin: user.is_admin,
        has_completed: user.has_completed,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get current user info
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, employee_id, full_name, department, position, email, is_admin, has_completed FROM users WHERE id = ?',
      [req.user.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Change password
 */
const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;

    // Get current user
    const user = await dbGet(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify old password
    const isValidPassword = await bcrypt.compare(old_password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10);

    // Update password
    await dbRun(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newPasswordHash, userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout (client-side token removal, but we can add to blacklist if needed)
 */
const logout = async (req, res) => {
  // In a production app, you might want to add the token to a blacklist
  res.json({ message: 'Logout successful' });
};

module.exports = {
  login,
  getCurrentUser,
  changePassword,
  logout,
};
