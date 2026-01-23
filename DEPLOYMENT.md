# Deployment Instructions for Hostinger Node.js App

## Prerequisites
- GitHub repository: https://github.com/Computech-IT/taxisikkim
- Hostinger Node.js hosting account

## Hostinger Setup Steps

### 1. Create Node.js Application
- Go to Hostinger hPanel → **Node.js Apps**
- Click **Create Application**

### 2. Configure Application
- **Application Name**: taxisikkim
- **Node.js Version**: 20.x (or latest LTS)
- **Entry Point**: `server.js`
- **Domain**: taxisikkim.com
- **GitHub Integration**: 
  - Connect your GitHub account
  - Select repository: `Computech-IT/taxisikkim`
  - Branch: `main`
  - **Auto-deploy**: Enable (deploys automatically on git push)

### 3. Environment Variables (Optional)
If you want email booking to work, add:
- `EMAIL_USER` = your-email@gmail.com
- `EMAIL_PASS` = your-app-password

### 4. Application Settings
- **Port**: Will be auto-assigned by Hostinger
- **Install Command**: `npm install` (default)
- **Build Command**: Leave empty (handled by postinstall script)
- **Start Command**: `npm start`

## How It Works

1. You push code to GitHub
2. Hostinger auto-pulls the code
3. Runs `npm install` 
4. The `postinstall` script automatically runs `npm run build`
5. Creates the `dist` folder with production files
6. Runs `npm start` which starts `server.js`
7. Server serves `dist/index.html` as the landing page

## File Structure After Deploy
```
/
├── dist/              (Auto-generated on deploy)
│   ├── index.html     (Landing page)
│   ├── assets/        (JS & CSS bundles)
│   └── favicon.png
├── server.js          (Express server)
├── package.json
├── src/               (Source files - not served)
├── index.html         (Development entry)
└── vite.config.js
```

## Testing Locally
```bash
npm install
npm run build
npm start
# Visit http://localhost:3000
```

## Deployment Workflow
```bash
# Make changes to your code
# Test locally
npm run dev

# Commit and push
git add .
git commit -m "Your changes"
git push

# Hostinger automatically:
# 1. Pulls code
# 2. Runs npm install
# 3. Builds (via postinstall)
# 4. Restarts server
```

## Important Notes
- ✅ Landing page: `dist/index.html` (served at root `/`)
- ✅ WhatsApp booking: Works
- ✅ Email booking: Works (if env vars set)
- ✅ Auto-deploy on git push
- ✅ Production optimized build

## Troubleshooting
- If site is blank: Check Hostinger logs for build errors
- If 404s: Ensure `dist` folder was created during build
- If stuck: Manually run build in Hostinger terminal: `npm run build`
