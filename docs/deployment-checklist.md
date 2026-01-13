# deployment checklist - spotify to apple music transfer

## pre-deployment verification

### environment variables

- [ ] verify netlify environment variables are set
  - APPLE_TEAM_ID = `5S855HB895`
  - APPLE_KEY_ID = `T5ZX676QRQ`
  - APPLE_P8_KEY = (with \n formatting)
  - AUTH0_DOMAIN = check netlify dashboard
  - AUTH0_CLIENT_ID = check netlify dashboard
  - AUTH0_AUDIENCE_SERVER = check netlify dashboard
  - SPOTIFY_CLIENT_ID = check _config.yml

command to verify:
```bash
netlify env:list
```

### spotify oauth configuration

- [ ] verify spotify developer dashboard redirect uris
  - production: `https://carsontkempf.github.io/spotify-apple/`
  - must match exactly (trailing slash matters)

steps:
1. go to https://developer.spotify.com/dashboard
2. select your app
3. go to "edit settings"
4. check redirect uris list
5. ensure production url is added

### auth0 configuration

- [ ] verify auth0 application settings
  - application type: single page application
  - allowed callback urls include: `https://carsontkempf.github.io`
  - allowed logout urls include: `https://carsontkempf.github.io`
  - allowed web origins include: `https://carsontkempf.github.io`

### code review

- [ ] all phase 1 changes tested
  - rate limiting (429) for spotify
  - rate limiting (429) for apple music
  - network retry logic
  - cancellation support

- [ ] all phase 2 changes tested
  - empty playlist detection
  - browser refresh warning
  - duplicate prevention (appends "from spotify")

- [ ] all phase 3 changes tested
  - user-friendly error messages
  - progress tracking

- [ ] no console errors in browser
- [ ] no linting errors
- [ ] all todo items completed

## local testing

### test with netlify dev

```bash
cd /Users/ctk/Programming/Published/carsontkempf.github.io
netlify dev
```

- [ ] server starts without errors
- [ ] functions load correctly
- [ ] get-apple-token function works
- [ ] can access /spotify-apple/ page
- [ ] auth0 login works
- [ ] spotify connect works
- [ ] apple music connect works
- [ ] small playlist converts successfully

### test commit

before deploying, make a test commit to feature branch:

```bash
git checkout -b test-playlist-transfer
git add .
git commit -m "test: playlist transfer enhancements"
git push origin test-playlist-transfer
```

- [ ] commit succeeds
- [ ] no merge conflicts
- [ ] branch pushed to github

## deployment preview testing

### create pull request

- [ ] create pr from feature branch to gh-pages
- [ ] pr description includes:
  - summary of changes
  - testing performed
  - known issues (if any)

### test on netlify deploy preview

netlify automatically creates deploy preview for prs

- [ ] wait for deploy preview build to complete
- [ ] visit deploy preview url
- [ ] run test suite 1 (authentication)
- [ ] run test suite 2 (small playlist)
- [ ] run test suite 4 (edge cases)
- [ ] check browser console for errors
- [ ] verify no broken styles/images

### staging environment verification

- [ ] auth0 login works on preview
- [ ] spotify oauth works (verify redirect uri)
- [ ] apple music works
- [ ] transfer completes successfully
- [ ] error messages are user-friendly
- [ ] cancel button works
- [ ] refresh warning works

## production deployment

### final checks

- [ ] all deploy preview tests passed
- [ ] no console errors on preview
- [ ] code reviewed by team (if applicable)
- [ ] documentation updated
- [ ] testing checklist completed

### merge to gh-pages

```bash
git checkout gh-pages
git merge test-playlist-transfer
git push origin gh-pages
```

- [ ] merge succeeds
- [ ] no conflicts
- [ ] pushed successfully

### verify production deployment

- [ ] github pages build completes
- [ ] visit https://carsontkempf.github.io/spotify-apple/
- [ ] page loads without errors
- [ ] no console errors
- [ ] auth required to access

### smoke tests on production

run quick smoke tests to verify deployment:

1. [ ] login with auth0
2. [ ] connect spotify account
3. [ ] connect apple music account
4. [ ] transfer 5-track test playlist
5. [ ] verify playlist in apple music app
6. [ ] check conversion results summary
7. [ ] disconnect and reconnect services

### monitor for errors

- [ ] check browser console in production
- [ ] verify no 404s on resources
- [ ] check network tab for failed requests
- [ ] test on mobile device
- [ ] test on different browsers

## rollback plan

if critical issues found in production:

### immediate rollback

```bash
git checkout gh-pages
git revert HEAD
git push origin gh-pages
```

or reset to previous commit:

```bash
git checkout gh-pages
git reset --hard <previous-commit-hash>
git push origin gh-pages --force
```

- [ ] rollback command ready
- [ ] previous commit hash documented
- [ ] team notified if rollback needed

### document issues

if rollback required:

1. create github issue with:
   - description of problem
   - steps to reproduce
   - error messages/screenshots
   - browser/device info

2. fix in feature branch:
   ```bash
   git checkout -b fix-issue-name
   # make fixes
   git commit -m "fix: description"
   git push origin fix-issue-name
   ```

3. re-test completely before redeploying

## post-deployment

### verification (within 24 hours)

- [ ] no error reports from users
- [ ] analytics show successful transfers
- [ ] no spike in failed requests
- [ ] rate limiting working as expected

### monitoring (ongoing)

- [ ] check for 429 rate limit errors
- [ ] monitor conversion success rates
- [ ] watch for auth failures
- [ ] track performance metrics

### documentation updates

- [ ] update changelog with new features
- [ ] update user guide if needed
- [ ] document any known issues
- [ ] update version number (if applicable)

## success criteria

deployment considered successful when:

- production site loads without errors
- auth0 authentication required and working
- spotify to apple music transfer works end-to-end
- >90% success rate on playlist conversions
- no console errors in supported browsers
- mobile experience functional
- no user-reported critical bugs within 48 hours

## contacts

if issues arise:

- github issues: https://github.com/carsontkempf/carsontkempf.github.io/issues
- rollback decision maker: project owner
- netlify support: support@netlify.com (if platform issue)

## notes

- always test on deploy preview before production
- never skip the smoke tests
- document any deviations from this checklist
- update checklist based on lessons learned
