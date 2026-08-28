const crypto = require('crypto');
const qrcode = require('qrcode');
const { dbRun, dbGet, dbQuery } = require('../db/database');

// --- BASE32 & TOTP HELPERS (HMAC-SHA1 RFC 6238) ---
const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function generateBase32Secret(length = 16) {
  let secret = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    secret += BASE32_CHARS[randomBytes[i] % 32];
  }
  return secret;
}

function base32Decode(base32) {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = '';
  let hex = '';
  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_CHARS.indexOf(clean.charAt(i));
    bits += val.toString(2).padStart(5, '0');
  }
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    const chunk = bits.substring(i, i + 8);
    hex += parseInt(chunk, 2).toString(16).padStart(2, '0');
  }
  return Buffer.from(hex, 'hex');
}

function generateTOTP(secretBase32, timeStepWindow = 0) {
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / 30) + timeStepWindow;
  
  const buffer = Buffer.alloc(8);
  let tempTime = timeStep;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = tempTime & 0xff;
    tempTime = Math.floor(tempTime / 256);
  }

  const key = base32Decode(secretBase32);
  const hmac = crypto.createHmac('sha1', key);
  hmac.update(buffer);
  const digest = hmac.digest();

  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

function verifyTOTPCode(secretBase32, code) {
  if (!secretBase32 || !code) return false;
  const cleanCode = code.toString().trim();
  // Check windows: current (0), previous (-1), next (+1) for drift tolerance
  for (let window = -1; window <= 1; window++) {
    if (generateTOTP(secretBase32, window) === cleanCode) {
      return true;
    }
  }
  return false;
}

async function generateMFAData(userEmail) {
  const secret = generateBase32Secret(16);
  const otpauthUrl = `otpauth://totp/NexusResearch:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=NexusResearch`;
  const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
  
  const backupCodes = Array.from({ length: 6 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  return { secret, qrCodeDataUrl, otpauthUrl, backupCodes };
}

// --- SVG CAPTCHA GENERATOR ---
async function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 20) + 1;
  const num2 = Math.floor(Math.random() * 15) + 1;
  const isPlus = Math.random() > 0.3;
  const text = isPlus ? `${num1} + ${num2}` : `${num1 + num2} - ${num2}`;
  const answer = (isPlus ? num1 + num2 : num1).toString();

  const token = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

  // SVG graphic generation
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="140" height="44" viewBox="0 0 140 44">
      <rect width="100%" height="100%" fill="#1e293b" rx="6"/>
      <path d="M 10 20 Q 35 5 60 20 T 110 20" stroke="#38bdf8" fill="none" stroke-width="2" opacity="0.3"/>
      <path d="M 5 30 Q 40 40 75 25 T 130 35" stroke="#818cf8" fill="none" stroke-width="2" opacity="0.3"/>
      <circle cx="20" cy="12" r="1.5" fill="#94a3b8" opacity="0.5"/>
      <circle cx="120" cy="32" r="1.5" fill="#94a3b8" opacity="0.5"/>
      <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-family="monospace" font-size="20" font-weight="bold" letter-spacing="2">
        ${text} = ?
      </text>
    </svg>
  `.trim();

  await dbRun(
    'INSERT INTO captcha_challenges (token, answer, expires_at) VALUES (?, ?, ?)',
    [token, answer, expiresAt]
  );

  return { token, captchaSvg: svg };
}

async function verifyCaptcha(token, answer) {
  if (!token || !answer) return false;
  const row = await dbGet('SELECT * FROM captcha_challenges WHERE token = ?', [token]);
  if (!row) return false;

  // Clean up used token
  await dbRun('DELETE FROM captcha_challenges WHERE token = ?', [token]);

  if (new Date(row.expires_at) < new Date()) {
    return false;
  }

  return row.answer.trim().toLowerCase() === answer.trim().toLowerCase();
}

// --- SECURITY AUDIT LOGGING ---
async function logSecurityEvent(userId, email, eventType, req, status, details = '') {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1').split(',')[0].trim() : 'SYSTEM';
    const userAgent = req ? (req.headers['user-agent'] || 'Unknown') : 'SYSTEM';

    await dbRun(
      `INSERT INTO security_audit_logs (user_id, email, event_type, ip_address, user_agent, status, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId || null, email || null, eventType, ip, userAgent, status, details]
    );

    // Detect suspicious login anomaly
    if (userId && status === 'SUCCESS' && eventType === 'LOGIN_SUCCESS') {
      const pastLogins = await dbQuery(
        `SELECT ip_address, user_agent FROM security_audit_logs 
         WHERE user_id = ? AND event_type = 'LOGIN_SUCCESS' AND status = 'SUCCESS' 
         ORDER BY id DESC LIMIT 10`,
        [userId]
      );
      if (pastLogins.length > 1) {
        const knownIps = new Set(pastLogins.map(l => l.ip_address));
        const knownUas = new Set(pastLogins.map(l => l.user_agent));
        if (!knownIps.has(ip) || !knownUas.has(userAgent)) {
          await dbRun(
            `INSERT INTO security_audit_logs (user_id, email, event_type, ip_address, user_agent, status, details)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, email, 'SUSPICIOUS_NEW_DEVICE', ip, userAgent, 'ALERT', `New IP or Device detected: ${ip}`]
          );
        }
      }
    }
  } catch (err) {
    console.error('Failed to write security log:', err.message);
  }
}

module.exports = {
  generateBase32Secret,
  verifyTOTPCode,
  generateMFAData,
  generateCaptcha,
  verifyCaptcha,
  logSecurityEvent
};
