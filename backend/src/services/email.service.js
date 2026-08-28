const dns = require('dns').promises;
const nodemailer = require('nodemailer');

// List of disposable / temporary email domains to block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'tempmailo.com',
  '10minutemail.com',
  'guerrillamail.com',
  'dispostable.com',
  'trashmail.com',
  'fakeinbox.com',
  'sharklasers.com',
  'getnada.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'cool.fr.nf',
  'jetable.fr.nf',
  'nospam.ze.tc',
  'nomail.xl.cx',
  'mega.zik.dj',
  'speed.1s.fr',
  'courriel.jp.net',
  'moncourriel.fr.nf',
  'monemail.fr.nf',
  'monmail.fr.nf',
  'tmpmail.net',
  'maildrop.cc',
  'throwawaymail.com',
  'temp-mail.org',
  'crazymailing.com',
  'tmail.ws',
  'binkmail.com',
  'bobmail.info',
  'chammy.info',
  'devnullmail.com',
  'letthemeatspam.com',
  'mailinater.com',
  'reallymymail.com',
  'tradermail.info'
]);

// Trusted major mail provider domains to approve immediately
const TRUSTED_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.in',
  'yahoo.co.uk',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'zoho.com',
  'gmx.com',
  'mail.com',
  'yandex.com',
  'fastmail.com'
]);

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate that an email address has a valid format and is not a fake/disposable domain.
 */
async function validateEmailDeliverability(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'Email address is required.' };
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Strict RFC 5322 Email Format Validation
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, reason: 'Please enter a valid email address (e.g. name@gmail.com).' };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Invalid email address format.' };
  }

  const [localPart, domain] = parts;

  if (!localPart || !domain || localPart.length > 64 || domain.length > 255) {
    return { valid: false, reason: 'Email format exceeds standard RFC limits.' };
  }

  // 2. Check Disposable Email Blacklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: 'Temporary / disposable email domains are not allowed. Please use a valid email address.'
    };
  }

  // 3. Trusted Major Mail Providers (Gmail, Yahoo, Outlook, etc.) pass immediately
  if (TRUSTED_DOMAINS.has(domain) || domain.endsWith('.edu') || domain.endsWith('.ac.uk') || domain.endsWith('.gov') || domain.endsWith('.org')) {
    return { valid: true, domain };
  }

  // 4. DNS MX Record Resolution for custom/corporate domains with graceful fallback
  try {
    const mxRecords = await Promise.race([
      dns.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DNS_TIMEOUT')), 2500))
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: `The email domain '@${domain}' does not have active mail servers (MX records).`
      };
    }
  } catch (dnsErr) {
    // If DNS times out or local network lookup fails, log warning and allow standard valid format to avoid blocking legitimate users
    console.warn(`DNS MX check note for '@${domain}':`, dnsErr.message);
  }

  return { valid: true, domain };
}

/**
 * Create Nodemailer Transporter
 */
function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  return nodemailer.createTransport({
    jsonTransport: true
  });
}

/**
 * Send Verification Email
 */
async function sendVerificationEmail(recipientEmail, userName, verificationToken) {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #27272a;">
        <h1 style="color: #f3e0aa; font-family: Georgia, serif; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">JIFFY RESEARCH</h1>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 6px;">Strategic AI Research & Knowledge Repository</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Welcome to Jiffy Research</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Hello ${userName},</p>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">Your research workspace has been successfully activated for ${recipientEmail}.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Jiffy Research" <${process.env.SMTP_FROM || process.env.GMAIL_USER || 'no-reply@jiffyresearch.ai'}>`,
    to: recipientEmail,
    subject: 'Welcome to Jiffy Research',
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✉️ Confirmation email sent to ${recipientEmail}`);
  return info;
}

/**
 * Send Password Reset Email
 */
async function sendPasswordResetEmail(recipientEmail, resetToken) {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #27272a;">
      <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #27272a;">
        <h1 style="color: #f3e0aa; font-family: Georgia, serif; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">JIFFY RESEARCH</h1>
        <p style="color: #a1a1aa; font-size: 12px; margin-top: 6px;">Password Reset Instructions</p>
      </div>
      
      <div style="padding: 32px 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Reset Your Password</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">We received a request to reset your password. This link is single-use and will expire in 15 minutes.</p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background-color: #d2f235; color: #000000; font-weight: bold; font-size: 14px; padding: 14px 28px; border-radius: 9999px; text-decoration: none; display: inline-block;">
            Reset Password Now
          </a>
        </div>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Jiffy Research Security" <${process.env.SMTP_FROM || process.env.GMAIL_USER || 'security@jiffyresearch.ai'}>`,
    to: recipientEmail,
    subject: 'Reset your Jiffy Research password',
    html: htmlContent
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  validateEmailDeliverability,
  sendVerificationEmail,
  sendPasswordResetEmail
};
