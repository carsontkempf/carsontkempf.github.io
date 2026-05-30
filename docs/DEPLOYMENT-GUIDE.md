# Learn SDK Deployment Guide

Complete guide for deploying Auth SDK and Secrets SDK to carsontkempf.github.io

## Prerequisites

- Access to Learn platform dashboard: https://ctklearn.carsontkempf.workers.dev
- Access to Netlify dashboard for carsontkempf.github.io
- Git access to both repositories

## Phase 1: Provision Tenant (Manual)

Since automated provisioning encountered PocketBase auth issues, follow these manual steps:

### 1.1 Login to Learn Platform

Visit: https://ctklearn.carsontkempf.workers.dev

Login with: carsontkempf@gmail.com

### 1.2 Create Project

1. Navigate to Dashboard → Projects
2. Click "Create New Project"
3. Name: "Static Site - carsontkempf.github.io"
4. Save the generated **App ID** (you'll need this)

### 1.3 Generate SDK Token

1. Go to Project Settings → SDK Tokens
2. Click "Generate New Token"
3. Label: "Production - GitHub Pages"
4. Allowed Origins: `carsontkempf.github.io` (no protocol, no slashes)
5. Expires: 365 days
6. Click "Generate"
7. **IMPORTANT**: Copy the full token (starts with `sk_live_...`) - it's only shown once!

### 1.4 Configure Secrets (for News API)

1. Go to Project Settings → Secrets
2. Add Secret:
   - Name: `newsapi`
   - Provider: `newsapi.org`
   - API Key: (your existing News API key)
   - Base URL: `https://newsapi.org`
   - Auth Header: `X-Api-Key`
3. Save

## Phase 2: Configure Netlify Environment Variables

### 2.1 Access Netlify Dashboard

1. Go to: https://app.netlify.com
2. Select: carsontkempf.github.io site
3. Navigate to: Site settings → Environment variables

### 2.2 Add Environment Variables

Add the following variables (click "Add a variable" for each):

```
LEARN_TENANT_URL=https://ctklearn.carsontkempf.workers.dev/api/auth
LEARN_PROJECT_APPID=<paste-app-id-from-step-1.2>
LEARN_SDK_TOKEN=<paste-sdk-token-from-step-1.3>
```

**IMPORTANT**:
- Replace `<paste-app-id-from-step-1.2>` with actual App ID
- Replace `<paste-sdk-token-from-step-1.3>` with actual token
- Never commit these values to git!

### 2.3 Verify Variables

After adding, you should see:
- `LEARN_TENANT_URL` = https://ctklearn.carsontkempf.workers.dev/api/auth
- `LEARN_PROJECT_APPID` = (your app ID)
- `LEARN_SDK_TOKEN` = sk_live_... (masked in UI)

## Phase 3: Deploy Learn Backend

### 3.1 Commit Changes

```bash
cd /Users/ctk/Programming/Published/learn

git add scripts/provision-static-site.mjs
git commit -m "feat: add static site provisioning script"
```

### 3.2 Deploy to Cloudflare Workers

```bash
wrangler deploy
```

Wait for deployment to complete (~30 seconds)

### 3.3 Verify Deployment

Visit: https://ctklearn.carsontkempf.workers.dev/testing

Check that:
- [ ] Page loads without errors
- [ ] D1 Read test passes
- [ ] D1 Write test passes
- [ ] All tests show green checkmarks

## Phase 4: Deploy Static Site

### 4.1 Review Changes

Check what will be deployed:

```bash
cd /Users/ctk/Programming/Published/carsontkempf.github.io

git status
```

Should show modified files:
- `_includes/widgets/header/head.html` (Auth0 removed, Learn SDK added)
- `_config-prod.yml` (Learn config added)
- `_pages/testing.html` (zero-config checkbox added)
- `_pages/rbac-testing.html` (new file)
- `assets/js/auth-service.js` (new file)
- `assets/js/rbac-protection.js` (new file)
- `assets/js/tier-manager.js` (new file)
- `assets/js/sdk-tester.js` (zero-config mode added)

### 4.2 Commit Changes

```bash
git add .
git commit -m "feat: migrate from Auth0 to Learn Auth SDK with RBAC

- Remove Auth0 CDN dependency
- Add Learn Auth SDK and auth-service wrapper
- Create RBAC protection and tier management modules
- Add comprehensive RBAC testing page
- Update Secrets SDK tester for zero-config mode
- Configure Learn platform in Jekyll prod config
"
```

### 4.3 Push to GitHub

```bash
git push origin main
```

This will automatically trigger Netlify deployment.

### 4.4 Monitor Netlify Build

1. Go to Netlify dashboard
2. Click on "Deploys" tab
3. Watch the build progress (takes ~2-3 minutes)
4. Wait for status to show "Published"

### 4.5 Verify Build Logs

In Netlify build logs, check for:
- [x] No Auth0 errors
- [x] Learn config variables substituted
- [x] Jekyll build successful
- [x] Deploy successful

## Phase 5: Production Testing

### 5.1 Test Auth SDK

Visit: https://carsontkempf.github.io/rbac-testing/

Tests to run:
1. Click "Refresh User Info"
   - Should show authentication status
   - Should display user email and name
   - Should list current roles

2. Test role checks:
   - Click each role test button (Admin, Premium, Writer, etc.)
   - Results should show pass/fail based on your actual roles

3. Test feature access:
   - Click feature test buttons
   - Should show which features you have access to

4. Verify tier display:
   - Should show "FREE" or "PREMIUM" badge
   - Premium content should hide/show correctly

### 5.2 Test Secrets SDK (Zero-Config Mode)

Visit: https://carsontkempf.github.io/testing/

Tests to run:
1. Verify "Use Zero-Config Mode" checkbox is checked
2. Click "Initialize SDK"
   - Should show "SDK initialized (zero-config)"
   - No errors in console

3. Test News API:
   - Select endpoint: "Top Headlines"
   - Leave query empty or enter a term
   - Click "Execute Request"
   - Should return news articles
   - Should show rate limit info

4. Try different endpoints:
   - "Everything" - search all articles
   - "Sources" - get news sources
   - All should work without errors

### 5.3 Test CORS

In testing page:
1. Click "Run CORS Diagnostics"
2. Check debug output for:
   - OPTIONS preflight successful
   - Access-Control-Allow-Origin header present
   - No CORS errors

### 5.4 Browser Console Checks

Open browser console (F12) and verify:
- [ ] `[Auth Service] Service initialized and ready`
- [ ] `[RBAC] Protection module loaded`
- [ ] `[Tier Manager] Module loaded`
- [ ] `[SDK-TEST] SDK Tester module loaded`
- [ ] No errors related to Auth0
- [ ] No 403 or 401 errors from Learn backend

## Phase 6: Assign Roles (Optional)

To test RBAC features, assign roles via Learn dashboard:

### 6.1 Access User Management

1. Login to: https://ctklearn.carsontkempf.workers.dev
2. Navigate to Project → Users or Admin panel

### 6.2 Assign Roles

Assign yourself test roles:
- `admin` - Full access to admin sections
- `premium` - Access to premium features
- `writer` - Content creation access
- `editor` - Content editing access

### 6.3 Verify Role Assignment

1. Go back to: https://carsontkempf.github.io/rbac-testing/
2. Click "Refresh User Info"
3. Should see new roles listed
4. Test role checks should now pass for assigned roles

## Troubleshooting

### Issue: Auth SDK Not Loading

**Symptoms:** Console shows "AuthSDK is not defined"

**Solution:**
1. Check `_includes/widgets/header/head.html` loads SDK scripts
2. Verify files exist:
   - `/assets/js/learn-auth-sdk.js`
   - `/assets/js/auth-service.js`
3. Check network tab for 404 errors

### Issue: Secrets SDK CORS Errors

**Symptoms:** "CORS policy blocked" or "Origin not allowed"

**Solution:**
1. Verify origin configured in Learn dashboard: `carsontkempf.github.io`
2. Check origin format (no `https://`, no trailing `/`)
3. Try CORS diagnostics in testing page
4. Check browser console for exact error

### Issue: "Forbidden" or 401 Errors

**Symptoms:** API calls return 403 or 401

**Solution:**
1. Verify Netlify env vars are set correctly
2. Check SDK token hasn't expired
3. Verify project App ID matches
4. Try regenerating SDK token in dashboard

### Issue: Environment Variables Not Substituted

**Symptoms:** Liquid templates show `${VAR_NAME}` in page source

**Solution:**
1. Check Netlify env vars are named correctly
2. Verify `_config-prod.yml` uses correct syntax
3. Check Netlify build uses production config
4. Review Netlify build logs for env var issues

### Issue: Netlify Build Fails

**Symptoms:** Deployment fails in Netlify

**Solution:**
1. Check Netlify build logs for specific error
2. Verify all files committed to git
3. Check Jekyll syntax in modified files
4. Test build locally: `bundle exec jekyll build --config _config.yml,_config-prod.yml`

## Rollback Procedure

If issues occur, rollback to Auth0:

### Option 1: Git Revert

```bash
cd /Users/ctk/Programming/Published/carsontkempf.github.io

# Find commit hash before Learn SDK migration
git log --oneline

# Revert to that commit
git revert <commit-hash>
git push origin main
```

Netlify will auto-deploy previous version in ~2 minutes.

### Option 2: Netlify Rollback

1. Go to Netlify dashboard → Deploys
2. Find last working deploy (before Learn SDK)
3. Click "..." menu → "Publish deploy"
4. Confirm rollback

## Success Checklist

- [ ] Learn backend deployed and /testing page works
- [ ] Netlify env vars configured
- [ ] Static site deployed successfully
- [ ] No Auth0 errors in console
- [ ] Auth SDK loads and initializes
- [ ] RBAC testing page shows user info
- [ ] Secrets SDK works in zero-config mode
- [ ] News API calls succeed
- [ ] CORS diagnostics pass
- [ ] No 403/401 errors
- [ ] Roles can be assigned and tested

## Next Steps

After successful deployment:

1. **Test Production Usage**
   - Use site normally for a few days
   - Monitor for any auth issues
   - Check error rates in browser console

2. **Assign Production Roles**
   - Set up real user roles (not just test)
   - Configure premium tier access
   - Set up admin users

3. **Monitor SDK Usage**
   - Check Learn dashboard for API usage
   - Monitor rate limits
   - Review error logs

4. **Document for Future Users**
   - Create user guide for static site integration
   - Document common patterns
   - Share learnings with team

5. **Remove Auth0 Completely**
   - Delete Auth0 env vars from Netlify
   - Remove Auth0 Netlify functions (if any remain)
   - Cancel Auth0 subscription (if applicable)

## Support

If issues persist:
- Check Learn platform docs: https://ctklearn.carsontkempf.workers.dev/docs
- Review plan file: `/Users/ctk/.claude/plans/velvety-sprouting-nova.md`
- Check implementation logs in this session

## Files Modified

Summary of all files changed in this implementation:

**Learn Platform:**
- `/scripts/provision-static-site.mjs` - Provisioning script (for future use)

**Static Site:**
- `/_includes/widgets/header/head.html` - SDK script loading
- `/_config-prod.yml` - Learn configuration
- `/_pages/testing.html` - Zero-config toggle
- `/_pages/rbac-testing.html` - RBAC testing page (new)
- `/assets/js/auth-service.js` - Auth wrapper (new)
- `/assets/js/rbac-protection.js` - RBAC helpers (new)
- `/assets/js/tier-manager.js` - Tier management (new)
- `/assets/js/sdk-tester.js` - Zero-config support
- `/DEPLOYMENT-GUIDE.md` - This file (new)

## Environment Variables Reference

**Netlify (carsontkempf.github.io):**
```
LEARN_TENANT_URL          - Auth API URL
LEARN_PROJECT_APPID       - Project identifier
LEARN_SDK_TOKEN           - SDK authentication token
```

**Learn Platform (Cloudflare Workers):**
No new env vars needed - uses existing:
- `AUTH_SECRET`
- `ORACLE_NGINX_DOMAIN`
- `POCKETBASE_SECRET_CURRENT`
