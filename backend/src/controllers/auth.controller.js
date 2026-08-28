const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbGet, dbRun, dbQuery } = require('../db/database');
const {
  generateCaptcha,
  verifyCaptcha,
  generateMFAData,
  verifyTOTPCode,
  logSecurityEvent
} = require('../services/security.service');

const {
  validateEmailDeliverability,
  sendPasswordResetEmail
} = require('../services/email.service');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // 1. STRICT EMAIL DELIVERABILITY & DOMAIN VERIFICATION (Block fake/disposable domains)
    const emailValidation = await validateEmailDeliverability(normalizedEmail);
    if (!emailValidation.valid) {
      await logSecurityEvent(null, normalizedEmail, 'REGISTER_INVALID_EMAIL_DOMAIN', req, 'FAILED', emailValidation.reason);
      return res.status(400).json({
        success: false,
        error: emailValidation.reason
      });
    }

    // 2. Check existing user
    const existingUser = await dbGet('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [normalizedEmail]);
    if (existingUser) {
      await logSecurityEvent(null, normalizedEmail, 'REGISTER_DUPLICATE_ATTEMPT', req, 'WARNING', 'Attempted duplicate signup');
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists. Please log in instead.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // First registered user becomes Admin, subsequent users become Researchers
    const userCountRow = await dbGet('SELECT COUNT(*) as count FROM users');
    const role = (userCountRow && userCountRow.count === 0) ? 'admin' : 'researcher';

    // Account created as verified automatically (No email verification step required)
    const result = await dbRun(
      `INSERT INTO users (name, email, password_hash, role, is_verified)
       VALUES (?, ?, ?, ?, 1)`,
      [name.trim(), normalizedEmail, password_hash, role]
    );

    const userId = result.id;

    // Create default workspace
    await dbRun(
      'INSERT INTO workspaces (user_id, name, description, domain) VALUES (?, ?, ?, ?)',
      [userId, 'My First Research Project', 'Default AI-powered research workspace for synthesizing insights', 'General Research']
    );

    const token = jwt.sign(
      { userId, name: name.trim(), email: normalizedEmail, role, token_version: 1 },
      process.env.JWT_SECRET || 'nexus_research_super_secret_jwt_key_2026_hackathon',
      { expiresIn: '7d' }
    );

    res.cookie('nexus_token', token, COOKIE_OPTIONS);

    await logSecurityEvent(userId, normalizedEmail, 'USER_REGISTERED', req, 'SUCCESS', `User registered with role: ${role}`);

    const newUser = await dbGet('SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?', [userId]);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: true,
        createdAt: newUser.created_at
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, error: 'Registration failed due to a server error.' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, captchaToken, captchaAnswer, mfaCode } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalizedEmail]);

    if (!user) {
      await bcrypt.compare(password, '$2a$10$abcdefghijklmnopqrstuuwxyz01234567890123456789012');
      await logSecurityEvent(null, normalizedEmail, 'LOGIN_FAILED', req, 'FAILED', 'Invalid user credentials');
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    // Check Account Lockout
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remainingMinutes = Math.ceil((new Date(user.locked_until) - new Date()) / (60 * 1000));
      await logSecurityEvent(user.id, normalizedEmail, 'LOGIN_BLOCKED_LOCKED', req, 'WARNING', `Attempt on locked account. ${remainingMinutes}m remaining`);
      return res.status(423).json({
        success: false,
        error: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`
      });
    }

    // Check CAPTCHA requirement
    if (user.failed_login_attempts >= 3) {
      if (!captchaToken || !captchaAnswer) {
        const captcha = await generateCaptcha();
        return res.status(400).json({
          success: false,
          error: 'Security CAPTCHA verification required due to recent failed login attempts.',
          requiresCaptcha: true,
          captchaToken: captcha.token,
          captchaSvg: captcha.captchaSvg
        });
      }

      const isCaptchaValid = await verifyCaptcha(captchaToken, captchaAnswer);
      if (!isCaptchaValid) {
        const updatedFailed = (user.failed_login_attempts || 0) + 1;
        await dbRun('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [updatedFailed, user.id]);
        await logSecurityEvent(user.id, normalizedEmail, 'CAPTCHA_FAILED', req, 'FAILED', 'Invalid CAPTCHA answer');

        const newCaptcha = await generateCaptcha();
        return res.status(400).json({
          success: false,
          error: 'Invalid or expired CAPTCHA code.',
          requiresCaptcha: true,
          captchaToken: newCaptcha.token,
          captchaSvg: newCaptcha.captchaSvg
        });
      }
    }

    // Verify Password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const newFailed = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      if (newFailed >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        await dbRun(
          'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
          [newFailed, lockedUntil, user.id]
        );
        await logSecurityEvent(user.id, normalizedEmail, 'ACCOUNT_LOCKED', req, 'ALERT', 'Account locked after 5 failed login attempts');
        return res.status(423).json({
          success: false,
          error: 'Account locked due to 5 consecutive failed login attempts. Please try again in 15 minutes.'
        });
      } else {
        await dbRun('UPDATE users SET failed_login_attempts = ? WHERE id = ?', [newFailed, user.id]);
        await logSecurityEvent(user.id, normalizedEmail, 'LOGIN_FAILED', req, 'FAILED', `Failed attempt ${newFailed}/5`);
      }

      let captchaData = {};
      if (newFailed >= 3) {
        const newCaptcha = await generateCaptcha();
        captchaData = {
          requiresCaptcha: true,
          captchaToken: newCaptcha.token,
          captchaSvg: newCaptcha.captchaSvg
        };
      }

      return res.status(401).json({
        success: false,
        error: 'Invalid credentials.',
        ...captchaData
      });
    }

    // Multi-Factor Authentication Verification
    if (user.mfa_enabled === 1) {
      if (!mfaCode) {
        await logSecurityEvent(user.id, normalizedEmail, 'MFA_CHALLENGE_ISSUED', req, 'SUCCESS', '2FA code required');
        return res.status(200).json({
          success: true,
          requiresMfa: true,
          message: 'Multi-factor authentication code required.'
        });
      }

      const isTotpValid = verifyTOTPCode(user.mfa_secret, mfaCode);
      let isBackupValid = false;

      if (!isTotpValid && user.mfa_backup_codes) {
        try {
          const backupCodes = JSON.parse(user.mfa_backup_codes);
          const cleanCode = mfaCode.trim().toUpperCase();
          if (backupCodes.includes(cleanCode)) {
            isBackupValid = true;
            const updatedCodes = backupCodes.filter(c => c !== cleanCode);
            await dbRun('UPDATE users SET mfa_backup_codes = ? WHERE id = ?', [JSON.stringify(updatedCodes), user.id]);
          }
        } catch (e) {}
      }

      if (!isTotpValid && !isBackupValid) {
        await logSecurityEvent(user.id, normalizedEmail, 'MFA_FAILED', req, 'FAILED', 'Invalid TOTP / backup code');
        return res.status(401).json({
          success: false,
          error: 'Invalid 2FA code. Please check your authenticator app.'
        });
      }
    }

    // Successful Login: Reset failed attempts
    await dbRun(
      'UPDATE users SET failed_login_attempts = 0, locked_until = NULL WHERE id = ?',
      [user.id]
    );

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'researcher',
        token_version: user.token_version || 1
      },
      process.env.JWT_SECRET || 'nexus_research_super_secret_jwt_key_2026_hackathon',
      { expiresIn: '7d' }
    );

    res.cookie('nexus_token', token, COOKIE_OPTIONS);

    await logSecurityEvent(user.id, normalizedEmail, 'LOGIN_SUCCESS', req, 'SUCCESS', 'User logged in successfully');

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'researcher',
        isVerified: true,
        mfaEnabled: Boolean(user.mfa_enabled),
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed due to a server error.' });
  }
};

const getCaptchaEndpoint = async (req, res) => {
  try {
    const captcha = await generateCaptcha();
    return res.json({
      success: true,
      captchaToken: captcha.token,
      captchaSvg: captcha.captchaSvg
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to generate CAPTCHA.' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email deliverability & domain
    const emailValidation = await validateEmailDeliverability(normalizedEmail);
    if (!emailValidation.valid) {
      return res.status(400).json({ success: false, error: emailValidation.reason });
    }

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [normalizedEmail]);

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      await dbRun(
        'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, tokenHash, expiresAt]
      );

      try {
        await sendPasswordResetEmail(normalizedEmail, resetToken);
      } catch (e) {
        console.error('Failed to send reset email:', e);
      }

      await logSecurityEvent(user.id, normalizedEmail, 'PASSWORD_RESET_REQUESTED', req, 'SUCCESS', `Token generated: ${resetToken}`);
      
      return res.json({
        success: true,
        message: 'If an account with that email address exists, password reset instructions have been sent to your inbox.',
        resetToken
      });
    }

    await logSecurityEvent(null, normalizedEmail, 'PASSWORD_RESET_REQUESTED_NONEXISTENT', req, 'WARNING', 'Reset requested for unknown email');

    return res.json({
      success: true,
      message: 'If an account with that email address exists, password reset instructions have been sent to your inbox.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to process password reset request.' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const resetRecord = await dbGet(
      `SELECT * FROM password_resets 
       WHERE token_hash = ? AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP`,
      [tokenHash]
    );

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid, used, or expired password reset token.'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    const user = await dbGet('SELECT id, email, token_version FROM users WHERE id = ?', [resetRecord.user_id]);
    const nextTokenVersion = (user.token_version || 1) + 1;

    await dbRun(
      `UPDATE users 
       SET password_hash = ?, token_version = ?, failed_login_attempts = 0, locked_until = NULL 
       WHERE id = ?`,
      [newPasswordHash, nextTokenVersion, resetRecord.user_id]
    );

    await dbRun('UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?', [resetRecord.id]);

    await logSecurityEvent(resetRecord.user_id, user.email, 'PASSWORD_RESET_SUCCESS', req, 'SUCCESS', 'Password reset successfully, invalidated old sessions');

    return res.json({
      success: true,
      message: 'Password reset successfully. All previous active sessions have been invalidated. Please log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
};

const setupMfa = async (req, res) => {
  try {
    const user = await dbGet('SELECT id, email, mfa_enabled FROM users WHERE id = ?', [req.user.userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const mfaData = await generateMFAData(user.email);
    await dbRun('UPDATE users SET mfa_secret = ? WHERE id = ?', [mfaData.secret, user.id]);

    return res.json({
      success: true,
      secret: mfaData.secret,
      qrCodeDataUrl: mfaData.qrCodeDataUrl,
      backupCodes: mfaData.backupCodes
    });
  } catch (error) {
    console.error('Setup MFA error:', error);
    return res.status(500).json({ success: false, error: 'Failed to generate 2FA setup details.' });
  }
};

const verifyMfaSetup = async (req, res) => {
  try {
    const { code, backupCodes } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    if (!user || !user.mfa_secret) {
      return res.status(400).json({ success: false, error: 'No 2FA setup request found. Please initiate 2FA setup first.' });
    }

    const isValid = verifyTOTPCode(user.mfa_secret, code);
    if (!isValid) {
      await logSecurityEvent(user.id, user.email, 'MFA_SETUP_FAILED', req, 'FAILED', 'Invalid code provided during 2FA setup');
      return res.status(400).json({ success: false, error: 'Invalid 2FA code. Please verify the code on your authenticator app.' });
    }

    const backupCodesJson = JSON.stringify(backupCodes || []);

    await dbRun(
      'UPDATE users SET mfa_enabled = 1, mfa_backup_codes = ? WHERE id = ?',
      [backupCodesJson, user.id]
    );

    await logSecurityEvent(user.id, user.email, 'MFA_ENABLED', req, 'SUCCESS', 'Multi-Factor Authentication enabled');

    return res.json({
      success: true,
      message: 'Multi-Factor Authentication (2FA) has been enabled successfully on your account.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to complete 2FA verification.' });
  }
};

const disableMfa = async (req, res) => {
  try {
    const { code, password } = req.body;
    const user = await dbGet('SELECT * FROM users WHERE id = ?', [req.user.userId]);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (password) {
      const isPassValid = await bcrypt.compare(password, user.password_hash);
      if (!isPassValid) {
        return res.status(401).json({ success: false, error: 'Invalid password.' });
      }
    } else if (code) {
      const isTotpValid = verifyTOTPCode(user.mfa_secret, code);
      if (!isTotpValid) {
        return res.status(401).json({ success: false, error: 'Invalid 2FA code.' });
      }
    } else {
      return res.status(400).json({ success: false, error: 'Password or 2FA code required to disable MFA.' });
    }

    await dbRun('UPDATE users SET mfa_enabled = 0, mfa_secret = NULL, mfa_backup_codes = NULL WHERE id = ?', [user.id]);
    await logSecurityEvent(user.id, user.email, 'MFA_DISABLED', req, 'WARNING', 'Multi-Factor Authentication disabled');

    return res.json({
      success: true,
      message: 'Multi-Factor Authentication (2FA) has been disabled.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to disable 2FA.' });
  }
};

const getSecurityLogs = async (req, res) => {
  try {
    const logs = await dbQuery(
      `SELECT id, event_type, ip_address, user_agent, status, details, created_at 
       FROM security_audit_logs 
       WHERE user_id = ? OR email = ? 
       ORDER BY id DESC LIMIT 50`,
      [req.user.userId, req.user.email]
    );

    return res.json({
      success: true,
      logs
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch security logs.' });
  }
};

const me = async (req, res) => {
  try {
    const user = await dbGet(
      'SELECT id, name, email, role, is_verified, mfa_enabled, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role || 'researcher',
        isVerified: true,
        mfaEnabled: Boolean(user.mfa_enabled),
        createdAt: user.created_at
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch user profile.' });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user) {
      await logSecurityEvent(req.user.userId, req.user.email, 'USER_LOGOUT', req, 'SUCCESS', 'User logged out');
    }
    res.clearCookie('nexus_token', COOKIE_OPTIONS);
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to log out.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mfaCode } = req.body || {};

    const user = await dbGet('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User account not found.' });
    }

    if (user.mfa_enabled === 1) {
      if (!mfaCode || !verifyTOTPCode(user.mfa_secret, mfaCode)) {
        return res.status(401).json({
          success: false,
          error: 'Sensitive action requires valid 2FA code confirmation.'
        });
      }
    }

    // Explicitly delete user's cascading records
    await dbRun('DELETE FROM documents WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM notes WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM chat_messages WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM reports WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM workspaces WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM password_resets WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM security_audit_logs WHERE user_id = ?', [userId]);
    await dbRun('DELETE FROM users WHERE id = ?', [userId]);

    res.clearCookie('nexus_token', COOKIE_OPTIONS);

    return res.json({ success: true, message: 'Account and associated research data deleted successfully.' });
  } catch (error) {
    console.error('Delete account error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete account.' });
  }
};

module.exports = {
  register,
  login,
  getCaptchaEndpoint,
  forgotPassword,
  resetPassword,
  setupMfa,
  verifyMfaSetup,
  disableMfa,
  getSecurityLogs,
  me,
  logout,
  deleteAccount
};
