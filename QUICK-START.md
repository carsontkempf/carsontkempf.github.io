# Quick Start: Replace Auth0 + Prove News API

Focused deployment to replace Auth0 with Learn Auth SDK and prove News API works through Secrets SDK.

## Goal

- ✅ Replace Auth0 authentication with Learn Auth SDK
- ✅ Prove News API works through Secrets SDK (zero-config mode)
- ⏭️ Keep Netlify for now (will replace later)

## Step 1: Manual Provisioning (5 minutes)

### 1.1 Login to Learn Platform

Visit: https://ctklearn.carsontkempf.workers.dev
Login: carsontkempf@gmail.com

### 1.2 Create Project

1. Dashboard → Projects → "Create New Project"
2. Name: "carsontkempf.github.io"
3. **Save the App ID** (e.g., `abc123def456`)

### 1.3 Generate SDK Token

1. Project Settings → SDK Tokens → "Generate New Token"
2. Label: "Production"
3. **Allowed Origins:** `carsontkempf.github.io` (no https://, no trailing /)
4. Expires: 365 days
5. **Copy the full token** (starts with `sk_live_...`) - shown only once!

### 1.4 Add News API Secret

1. Project Settings → Secrets → "Add Secret"
2. Fill in:
   - **Name:** `newsapi`
   - **Provider:** Custom or newsapi.org
   - **API Key:** (your existing News API key)
   - **Base URL:** `https://newsapi.org`
   - **Auth Header:** `X-Api-Key`
3. Save

## Step 2: Configure Netlify (2 minutes)

### 2.1 Go to Netlify Dashboard

https://app.netlify.com → carsontkempf.github.io site → Site settings → Environment variables

### 2.2 Add These 3 Variables

Click "Add a variable" for each:

```
Variable 1:
Key: LEARN_TENANT_URL
Value: https://ctklearn.carsontkempf.workers.dev/api/auth

Variable 2:
Key: LEARN_PROJECT_APPID
Value: <paste your App ID from step 1.2>

Variable 3:
Key: LEARN_SDK_TOKEN
Value: <paste your SDK token from step 1.3>
```

**Important:** Replace the values with your actual App ID and token!

## Step 3: Deploy (Automatic)

### Changes Already Pushed

Both repos have been pushed:
- ✅ Learn backend: `git push origin main` (done)
- ✅ Static site: `git push origin gh-pages` (done)

### 3.1 Deploy Learn Backend

```bash
cd /Users/ctk/Programming/Published/learn
wrangler deploy
```

Wait for: `✨ Deployment complete!`

### 3.2 Trigger Netlify Deployment

Netlify should auto-deploy since we pushed to `gh-pages`. If not:

```bash
cd /Users/ctk/Programming/Published/carsontkempf.github.io
git commit --allow-empty -m "trigger netlify deploy"
git push origin gh-pages
```

Monitor at: https://app.netlify.com (Deploys tab)

## Step 4: Test Production (5 minutes)

### 4.1 Test Auth SDK (Replace Auth0)

Visit: https://carsontkempf.github.io/rbac-testing/

**Expected:**
- ✅ Page loads without Auth0 errors
- ✅ "Current User Info" section shows data if logged in
- ✅ Can see your roles (if any assigned)
- ✅ Console shows `[Auth Service] Service initialized and ready`

**Check Console (F12):**
- ✅ No "auth0 is not defined" errors
- ✅ No 403/401 errors
- ✅ See `[Auth Service]` logs

### 4.2 Test Secrets SDK (Prove News API)

Visit: https://carsontkempf.github.io/testing/

**Test Zero-Config Mode:**
1. Verify "Use Zero-Config Mode" is **checked**
2. Click "Initialize SDK"
   - ✅ Should show: "SDK initialized (zero-config)"
3. Leave endpoint as "Top Headlines"
4. Click "Execute Request"
   - ✅ Should return news articles
   - ✅ Should show rate limit: "X / 100 requests remaining"

**Expected in Console:**
- ✅ `[SDK-TEST] Using ZERO-CONFIG MODE`
- ✅ `[SDK-TEST] SDK initialized successfully (zero-config)`
- ✅ No CORS errors
- ✅ News data returned

### 4.3 Verify Auth0 Removed

**Check page source (Ctrl+U):**
- ❌ Should NOT see: `cdn.auth0.com`
- ✅ Should see: `/assets/js/learn-auth-sdk.js`
- ✅ Should see: `/assets/js/auth-service.js`

**Check browser console:**
- ❌ No Auth0 errors
- ❌ No "auth0 is not defined"
- ✅ Only Learn Auth SDK logs

## Success Criteria

### Auth SDK ✅
- [ ] RBAC testing page loads
- [ ] No Auth0 references in page source
- [ ] No Auth0 errors in console
- [ ] Auth service initializes successfully

### Secrets SDK ✅
- [ ] Zero-config mode works
- [ ] News API returns articles
- [ ] Rate limiting displays correctly
- [ ] No CORS errors

## Troubleshooting

### Issue: "Origin not allowed" error

**Fix:** Check origin in Learn dashboard is exactly: `carsontkempf.github.io`
- No `https://`
- No trailing `/`
- No `www.`

### Issue: "SDK Token is invalid"

**Fix:** Regenerate token in Learn dashboard and update Netlify env var

### Issue: Netlify env vars not working

**Fix:**
1. Verify vars are named EXACTLY as shown (case-sensitive)
2. Trigger new deploy: `git commit --allow-empty -m "redeploy" && git push`
3. Check Netlify build logs for substitution

### Issue: News API returns 401

**Fix:** Check News API secret configured correctly in Learn dashboard:
- Name: `newsapi`
- API Key: (your valid key)
- Base URL: `https://newsapi.org`

## Quick Verification Commands

```bash
# Check Learn backend deployed
curl https://ctklearn.carsontkempf.workers.dev/testing

# Check static site deployed
curl -I https://carsontkempf.github.io/rbac-testing/

# Check Netlify build status
# (Visit Netlify dashboard)
```

## What We're NOT Doing Yet

- ❌ NOT replacing Netlify hosting (keeping it for now)
- ❌ NOT migrating Netlify Functions (keeping them)
- ❌ NOT changing DNS or domain setup
- ❌ NOT replacing other services

We're ONLY:
- ✅ Replacing Auth0 with Learn Auth SDK
- ✅ Proving News API works via Secrets SDK

## Next Steps After Successful Deploy

1. **Test for a few days** - Make sure auth works in production
2. **Assign some roles** - Test RBAC features work
3. **Monitor logs** - Check for any issues
4. **Eventually**: Replace Netlify hosting with Learn backend

## Summary

1. ✅ Provision manually in Learn dashboard (5 min)
2. ✅ Add 3 env vars to Netlify (2 min)
3. ✅ Deploy Learn backend: `wrangler deploy`
4. ✅ Netlify auto-deploys from git push
5. ✅ Test both pages work

**Total time:** ~15 minutes + testing

That's it! Auth0 replaced, News API proven. 🎉
