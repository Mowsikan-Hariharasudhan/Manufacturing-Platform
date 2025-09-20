const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/database');
const { sendResetEmail } = require('../utils/emailService');

const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id, 
      username: user.username, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '24h' }
  );
};

const register = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      role = 'operator' 
    } = req.body;

    // Check if user already exists
    const existingUser = await client.query(
      'SELECT user_id FROM users WHERE username = $1 OR email = $2',
      [username.toLowerCase(), email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username or email already exists' 
      });
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await client.query(`
      INSERT INTO users (
        username, email, password_hash, first_name, 
        last_name, phone, role, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING user_id, username, email, first_name, last_name, role, created_at
    `, [
      username.toLowerCase(), 
      email.toLowerCase(), 
      passwordHash, 
      firstName, 
      lastName, 
      phone, 
      role,
      true
    ]);

    const newUser = result.rows[0];
    await client.query('COMMIT');

    // Generate JWT token for auto-login
    const token = generateToken({
      userId: newUser.user_id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: token,
      user: {
        id: newUser.user_id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        role: newUser.role,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again.' 
    });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Get user with password hash
    const result = await pool.query(
      'SELECT * FROM users WHERE (username = $1 OR email = $1) AND is_active = true',
      [username.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update last login
    await pool.query(
      'UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE user_id = $1',
      [user.user_id]
    );

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.user_id,
        username: user.username,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Login failed. Please try again.' 
    });
  }
};

const forgotPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email } = req.body;

    // Check if user exists
    const userResult = await client.query(
      'SELECT user_id, email, first_name FROM users WHERE email = $1 AND is_active = true',
      [email.toLowerCase()]
    );

    // Always return success to prevent email enumeration
    if (userResult.rows.length === 0) {
      return res.json({
        success: true,
        message: 'If the email exists, a reset code has been sent'
      });
    }

    const user = userResult.rows[0];

    // Generate 6-digit reset code
    const resetToken = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    await client.query('BEGIN');

    // Invalidate any existing tokens for this user
    await client.query(
      'UPDATE password_reset_tokens SET is_used = true WHERE user_id = $1 AND is_used = false',
      [user.user_id]
    );

    // Insert new reset token
    await client.query(`
      INSERT INTO password_reset_tokens (user_id, token, expires_at) 
      VALUES ($1, $2, $3)
    `, [user.user_id, resetToken, expiresAt]);

    await client.query('COMMIT');

    // Send reset email
    try {
      await sendResetEmail(user.email, user.first_name, resetToken);
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the request if email fails
    }

    res.json({
      success: true,
      message: 'If the email exists, a reset code has been sent'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process request' 
    });
  } finally {
    client.release();
  }
};

const resetPassword = async (req, res) => {
  const client = await pool.connect();

  try {
    const { email, resetToken, newPassword } = req.body;

    await client.query('BEGIN');

    // Find valid reset token
    const tokenResult = await client.query(`
      SELECT rt.token_id, rt.user_id, u.email 
      FROM password_reset_tokens rt
      JOIN users u ON rt.user_id = u.user_id
      WHERE u.email = $1 AND rt.token = $2 
        AND rt.expires_at > CURRENT_TIMESTAMP 
        AND rt.is_used = false
    `, [email.toLowerCase(), resetToken]);

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    const { token_id, user_id } = tokenResult.rows[0];

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [passwordHash, user_id]
    );

    // Mark token as used
    await client.query(
      'UPDATE password_reset_tokens SET is_used = true WHERE token_id = $1',
      [token_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to reset password' 
    });
  } finally {
    client.release();
  }
};

const verifyToken = async (req, res) => {
  // This endpoint is called by the auth middleware
  // If we reach here, the token is valid
  res.json({
    success: true,
    user: {
      id: req.user.user_id,
      username: req.user.username,
      email: req.user.email,
      firstName: req.user.first_name,
      lastName: req.user.last_name,
      role: req.user.role
    }
  });
};

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken
};
