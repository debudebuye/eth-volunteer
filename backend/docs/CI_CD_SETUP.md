# CI/CD Setup Guide

## 🚀 Overview

Your project now has complete CI/CD pipelines using GitHub Actions for:
- ✅ Automated testing
- ✅ Code quality checks
- ✅ Security scanning
- ✅ Automated deployment to Vercel/Heroku

## 📋 Workflows Created

### 1. CI - Test and Lint (`ci.yml`)
**Triggers**: Push to main/develop, Pull Requests

**What it does**:
- Runs tests on Node.js 16, 18, and 20
- Runs ESLint for code quality
- Checks code formatting with Prettier
- Runs security audit
- Uploads test coverage

### 2. Deploy to Vercel (`deploy-vercel.yml`)
**Triggers**: Push to main, Manual trigger

**What it does**:
- Runs tests before deployment
- Builds the project
- Deploys to Vercel production
- Notifies success/failure

### 3. Deploy to Heroku (`deploy-heroku.yml`)
**Triggers**: Push to main, Manual trigger

**What it does**:
- Runs tests before deployment
- Deploys to Heroku
- Performs health check
- Notifies deployment status

### 4. CodeQL Security Analysis (`codeql.yml`)
**Triggers**: Push, Pull Requests, Weekly schedule

**What it does**:
- Scans code for security vulnerabilities
- Checks for common security issues
- Runs weekly automated scans

### 5. Pull Request Checks (`pr-checks.yml`)
**Triggers**: Pull Request opened/updated

**What it does**:
- Runs all quality checks
- Checks for console.logs
- Verifies code formatting
- Comments on PR with results

## 🔧 Setup Instructions

### Step 1: GitHub Repository Setup

1. **Create a GitHub repository** (if not already done)
2. **Push your code**:
```bash
git init
git add .
git commit -m "Initial commit with CI/CD"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### Step 2: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### For Vercel Deployment:
1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token
   - Copy and add as secret

2. **VERCEL_ORG_ID** (optional)
   - Run: `vercel whoami`
   - Copy your org ID

3. **VERCEL_PROJECT_ID** (optional)
   - Go to your Vercel project settings
   - Copy the Project ID

#### For Heroku Deployment:
1. **HEROKU_API_KEY**
   - Go to [Heroku Account Settings](https://dashboard.heroku.com/account)
   - Reveal API Key
   - Copy and add as secret

2. **HEROKU_APP_NAME**
   - Your Heroku app name (e.g., `eth-volunteer-api`)

3. **HEROKU_EMAIL**
   - Your Heroku account email

#### For Testing:
1. **MONGO_URI_TEST**
   - Create a separate MongoDB database for testing
   - Add the connection string

#### Environment Variables (for deployment):
Add these in Vercel/Heroku dashboard:
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`
- `FRONTEND_URL`
- `EMAIL_USER`
- `EMAIL_PASS`

### Step 3: Enable GitHub Actions

1. Go to your repository
2. Click on **"Actions"** tab
3. Enable workflows if prompted

### Step 4: Test the CI/CD

#### Test CI Pipeline:
```bash
# Create a new branch
git checkout -b test-ci

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "Test CI pipeline"
git push origin test-ci

# Create a Pull Request on GitHub
```

The CI pipeline will automatically run!

#### Test Deployment:
```bash
# Merge to main branch
git checkout main
git merge test-ci
git push origin main
```

The deployment pipeline will automatically run!

## 📊 Monitoring CI/CD

### View Workflow Runs
1. Go to your GitHub repository
2. Click **"Actions"** tab
3. See all workflow runs and their status

### Check Deployment Status
- **Vercel**: Check [Vercel Dashboard](https://vercel.com/dashboard)
- **Heroku**: Check [Heroku Dashboard](https://dashboard.heroku.com/)

### View Logs
Click on any workflow run to see detailed logs.

## 🔄 Workflow Triggers

### Automatic Triggers:
- **Push to main**: Runs CI + Deployment
- **Push to develop**: Runs CI only
- **Pull Request**: Runs PR checks
- **Weekly**: Runs security scan

### Manual Triggers:
1. Go to Actions tab
2. Select workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

## 🛠️ Customization

### Change Node.js Version
Edit `.github/workflows/ci.yml`:
```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]  # Remove 16.x if not needed
```

### Change Deployment Branch
Edit deployment workflows:
```yaml
on:
  push:
    branches: [production]  # Change from 'main'
```

### Add More Tests
Edit `.github/workflows/ci.yml`:
```yaml
- name: Run integration tests
  run: npm run test:integration
```

### Add Slack Notifications
Add to any workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🚨 Troubleshooting

### CI Fails on Tests
- Check test logs in Actions tab
- Ensure `MONGO_URI_TEST` secret is set
- Run tests locally: `npm test`

### Deployment Fails
- Check deployment logs
- Verify all secrets are set correctly
- Check environment variables in Vercel/Heroku

### Linting Fails
- Run locally: `npm run lint`
- Fix issues: `npm run lint:fix`

### Security Audit Fails
- Check which packages have vulnerabilities
- Update dependencies: `npm update`
- Or: `npm audit fix`

## 📈 Best Practices

### 1. Branch Protection
Enable branch protection on `main`:
- Require PR reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Semantic Versioning
Use conventional commits:
```bash
git commit -m "feat: add new endpoint"
git commit -m "fix: resolve authentication bug"
git commit -m "docs: update API documentation"
```

### 3. Environment-Specific Configs
- Use `.env.development` for local
- Use `.env.test` for testing
- Use secrets for production

### 4. Monitoring
- Set up error tracking (Sentry)
- Monitor API performance
- Set up uptime monitoring

## 🎯 Next Steps

1. ✅ Push code to GitHub
2. ✅ Configure secrets
3. ✅ Test CI pipeline with a PR
4. ✅ Test deployment to staging
5. ✅ Deploy to production
6. ✅ Set up monitoring
7. ✅ Enable branch protection

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment](https://vercel.com/docs)
- [Heroku Deployment](https://devcenter.heroku.com/)
- [CodeQL](https://codeql.github.com/)

## 🆘 Need Help?

- Check workflow logs in Actions tab
- Review this documentation
- Check GitHub Actions documentation
- Create an issue in the repository

---

**Your CI/CD is ready!** 🎉

Push your code to GitHub and watch the magic happen!
