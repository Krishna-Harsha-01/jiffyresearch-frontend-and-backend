const { z } = require('zod');

const validateBody = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    next(error);
  }
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email format').toLowerCase().trim(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
  mfaCode: z.string().optional()
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase().trim()
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
});

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
});

const mfaVerifySchema = z.object({
  code: z.string().length(6, '2FA Code must be exactly 6 digits')
});

const updateRoleSchema = z.object({
  userId: z.number().int().positive(),
  role: z.enum(['admin', 'researcher', 'viewer'])
});

const workspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  description: z.string().optional(),
  domain: z.string().optional()
});

const noteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  tags: z.array(z.string()).optional()
});

module.exports = {
  validateBody,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  mfaVerifySchema,
  updateRoleSchema,
  workspaceSchema,
  noteSchema
};
