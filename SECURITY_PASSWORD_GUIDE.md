# Password Security Guide

## Current Implementation

Currently, passwords are stored in plaintext in environment variables (`ARTIST_PASSWORDS` and `STAFF_PASSWORDS`). This is acceptable for development but should be improved for production.

## Recommended Improvements

### Option 1: Password Hashing (Recommended for Production)

Implement bcrypt hashing for passwords:

1. **Install bcrypt:**
   ```bash
   npm install bcryptjs
   npm install --save-dev @types/bcryptjs
   ```

2. **Update auth.ts** to hash passwords before comparison:
   ```typescript
   import bcrypt from "bcryptjs";
   
   // Hash passwords before storing in env (one-time setup)
   const hashedPassword = await bcrypt.hash("plaintext-password", 10);
   
   // Compare during authentication
   const isValid = await bcrypt.compare(inputPassword, storedHash);
   ```

3. **Update .env.example** to store hashed passwords:
   ```env
   ARTIST_PASSWORDS='{"big-russ":"$2a$10$hashedpasswordhere"}'
   ```

### Option 2: OAuth Providers (Best Security)

Use OAuth providers (Google, GitHub, etc.) instead of passwords:
- No password storage needed
- Better security
- Easier user management

### Option 3: Password Manager Integration

For small teams, use a password manager to:
- Generate strong passwords
- Store them securely
- Rotate them regularly

## Password Requirements (If keeping password auth)

1. **Minimum 12 characters**
2. **Mix of uppercase, lowercase, numbers, symbols**
3. **No common words or patterns**
4. **Rotate every 90 days**

## Environment Variable Security

- ✅ Never commit `.env` files to git
- ✅ Use different passwords for dev/staging/production
- ✅ Rotate secrets regularly
- ✅ Use a secrets manager (AWS Secrets Manager, Vault, etc.) in production
- ✅ Limit access to environment variables

## Implementation Priority

- **Short-term:** Keep current system but enforce strong passwords
- **Medium-term:** Implement bcrypt hashing
- **Long-term:** Migrate to OAuth or passwordless auth
