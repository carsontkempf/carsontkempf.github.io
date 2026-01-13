# spotify to apple music playlist transfer - testing plan

## test suite 1: authentication

- [ ] cannot access page without auth0 login
  - test: go to /spotify-apple/ logged out
  - expected: see login prompt, no content visible
  - pass criteria: only login button shows

- [ ] spotify connect button works
  - test: click "connect spotify" after auth0 login
  - expected: redirect to spotify oauth, return with token
  - pass criteria: "spotify connected" shows with username

- [ ] apple music connect button works
  - test: click "connect apple music"
  - expected: musickit popup appears, authorization succeeds
  - pass criteria: "apple music connected" shows

- [ ] token refresh works
  - test: wait 1 hour, make api call
  - expected: auto-refresh tokens, no 401 errors
  - pass criteria: operations continue without re-auth

## test suite 2: small playlist (10 tracks)

setup: create test playlist with 10 popular songs (beatles, queen, etc.)

- [ ] all 10 tracks transfer correctly
  - expected: 100% match rate for popular songs
  - pass criteria: 10/10 tracks in apple music playlist

- [ ] track order preserved
  - expected: apple music playlist has same order as spotify
  - pass criteria: track #1, #5, #10 match positions

- [ ] explicit content preserved
  - setup: include explicit tracks in test playlist
  - expected: explicit tracks match to explicit versions
  - pass criteria: explicit badge shows in apple music

- [ ] completes in <30 seconds
  - expected: fast completion for small playlist
  - pass criteria: total time < 30 seconds

## test suite 3: large playlist (200+ tracks)

setup: use existing large playlist or create one

- [ ] >90% match rate achieved
  - expected: most tracks found in apple music
  - pass criteria: success rate ≥ 90%

- [ ] no timeout errors
  - expected: long playlist completes without timeout
  - pass criteria: conversion completes successfully

- [ ] no rate limit errors (429)
  - expected: rate limiting handled gracefully
  - pass criteria: no 429 errors in console, auto-retry works

- [ ] completes in <5 minutes
  - expected: 200 tracks in reasonable time
  - pass criteria: total time < 300 seconds

## test suite 4: edge cases

- [ ] empty playlist (0 tracks)
  - setup: create empty spotify playlist
  - test: attempt to convert
  - expected: friendly message "playlist is empty"
  - pass criteria: no error thrown, clear message

- [ ] playlist with special chars "🎵 test & more"
  - setup: create playlist with emojis, &, special unicode
  - test: convert to apple music
  - expected: name preserved correctly
  - pass criteria: apple music playlist has same name

- [ ] playlist with local files
  - setup: add local files to spotify playlist
  - test: convert playlist
  - expected: local files skipped gracefully
  - pass criteria: other tracks convert, no errors

- [ ] playlist with podcasts
  - setup: add podcast episodes to playlist
  - test: convert playlist
  - expected: podcasts skipped, only music tracks converted
  - pass criteria: music tracks convert successfully

## test suite 5: error scenarios

- [ ] network disconnect mid-transfer
  - test: start transfer, disconnect wifi/ethernet
  - expected: network error detected, retry logic kicks in
  - pass criteria: shows "connection lost" message, retries when reconnected

- [ ] revoke apple music access mid-transfer
  - test: start transfer, revoke musickit permission
  - expected: authorization error detected
  - pass criteria: shows "please reconnect apple music" message

- [ ] browser refresh during transfer
  - test: start transfer, press cmd+r or f5
  - expected: warning dialog appears
  - pass criteria: "transfer in progress" warning shows

- [ ] cancel transfer
  - test: start transfer, click cancel button
  - expected: transfer stops gracefully
  - pass criteria: partial results shown, no errors

## test suite 6: explicit content

- [ ] playlist with explicit tracks
  - setup: playlist with explicit songs (e.g., eminem, kanye)
  - test: convert playlist
  - expected: explicit versions matched
  - pass criteria: explicit match rate > 90%

- [ ] playlist with clean tracks
  - setup: playlist with clean/radio edit songs
  - test: convert playlist
  - expected: clean versions matched
  - pass criteria: correct version type preserved

- [ ] mixed playlist
  - setup: playlist with mix of explicit and clean
  - test: convert playlist
  - expected: stats show explicit match rate
  - pass criteria: summary shows explicit matches/mismatches

## test suite 7: rate limiting

- [ ] spotify rate limiting handled
  - test: transfer multiple large playlists quickly
  - expected: 429 errors handled with retry-after
  - pass criteria: conversions complete despite rate limits

- [ ] apple music rate limiting handled
  - test: rapid api calls to apple music
  - expected: auto-throttling and retry
  - pass criteria: no failed requests due to 429

## acceptance criteria

all tests must pass before deployment:

- auth0 authentication required ✓
- spotify oauth works ✓
- apple music authorization works ✓
- small playlists convert 100%
- large playlists convert >90%
- explicit content preserved
- edge cases handled gracefully
- error messages are user-friendly
- cancellation works
- refresh warning shows
- no console errors
- ui responsive

## manual testing checklist

before deploying to production:

1. test on chrome (desktop)
2. test on safari (desktop)
3. test on firefox (desktop)
4. test on mobile safari (ios)
5. test on mobile chrome (android if available)
6. test with slow 3g network
7. test with browser dev tools > network > offline mode
8. verify no console errors
9. verify no broken images/styles
10. verify all buttons work
11. test logout and re-login flow
12. test token expiration (wait 1 hour)

## regression testing

after each code change:

- [ ] basic transfer still works (5-track playlist)
- [ ] no new console errors
- [ ] ui still renders correctly
- [ ] auth still required
- [ ] no broken functionality

## performance benchmarks

track these metrics during testing:

- small playlist (10 tracks): target <30s, acceptable <60s
- medium playlist (50 tracks): target <90s, acceptable <180s
- large playlist (200 tracks): target <300s, acceptable <600s
- track matching speed: target <2s per track

## notes

- use real spotify/apple music accounts for testing
- test with variety of music genres and languages
- document any failing tests with screenshots
- log all errors in browser console for debugging
- test during peak hours and off-peak hours
- verify rate limiting doesn't block legitimate use
