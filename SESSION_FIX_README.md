# Session Fix - File Store Implementation

## Quick Deploy Steps

### 1. Install New Dependency
On Hostinger (SSH):
```bash
cd /path/to/your/domain
npm install session-file-store
```

### 2. Update Files
Pull from Git or upload:
- `server-mysql.js` → rename to `server.js`
- `package.json`

### 3. Create Sessions Directory
```bash
mkdir sessions
chmod 755 sessions
```

### 4. Update .gitignore
Add to `.gitignore`:
```
sessions/
```

### 5. Restart Application
Hostinger Panel > Node.js > Restart

## Why This Works

**File-based sessions** are stored on disk instead of memory, making them:
- ✅ Persistent across server restarts
- ✅ More reliable on shared hosting
- ✅ Work better with Hostinger's load balancer
- ✅ Survive process crashes

## Test After Deployment

1. Login to admin panel
2. Check DevTools > Application > Cookies
3. Should see `taxisikkim.sid` cookie with:
   - `Secure`: Yes (on HTTPS)
   - `HttpOnly`: Yes
   - `SameSite`: Lax
   - `Expires`: 24 hours from now

## Changes Made

- Added `session-file-store` package
- Sessions stored in `./sessions/` directory
- `secure: true` for production HTTPS
- File-based sessions persist between requests

This should fix the 401 error!
