# spotify to apple music playlist transfer - developer checklist

## phase 1: authentication & authorization

### spotify authentication
- [ ] implement spotify oauth 2.0 flow
  - success criteria: user can authorize and receive access token
  - test: console.log() access token after auth flow completes
- [ ] request correct spotify scopes
  - required scopes: `playlist-read-private`, `playlist-read-collaborative`
  - success criteria: can read user playlists without 403 errors
  - test: GET /v1/me/playlists returns 200
- [ ] implement spotify token refresh
  - success criteria: auto-refresh tokens before expiry
  - test: make API call after token expiry, verify no 401 error
- [ ] store spotify tokens securely
  - success criteria: tokens stored in httpOnly cookies or secure storage
  - test: inspect browser storage, verify tokens not in localStorage

### apple music authentication
- [ ] fetch developer token from netlify function
  - endpoint: /.netlify/functions/get-apple-token
  - success criteria: returns valid JWT token
  - test: decode JWT, verify iss=5S855HB895, kid=F9Q8YRKX3T
- [ ] implement apple music user authorization
  - use MusicKit.getInstance().authorize()
  - success criteria: user grants music library access
  - test: MusicKit.getInstance().isAuthorized === true
- [ ] verify apple music user token validity
  - success criteria: can make authenticated API calls
  - test: GET /v1/me/library/playlists returns 200
- [ ] handle apple music subscription check
  - success criteria: detect if user has active apple music subscription
  - test: MusicKit.getInstance().musicUserToken exists

## phase 2: spotify data retrieval

### fetch playlists
- [ ] get all user playlists from spotify
  - endpoint: GET /v1/me/playlists
  - success criteria: retrieve complete list with pagination
  - test: verify total count matches spotify web UI
- [ ] handle playlist pagination
  - spotify returns max 50 playlists per page
  - success criteria: fetch all pages until next === null
  - test: if user has >50 playlists, verify all are retrieved
- [ ] display playlist selection UI
  - success criteria: user can select one or multiple playlists
  - test: UI shows playlist name, track count, image
- [ ] validate playlist selection
  - success criteria: at least one playlist selected before proceeding
  - test: disable "Transfer" button until selection made

### fetch tracks from selected playlists
- [ ] get all tracks for each selected playlist
  - endpoint: GET /v1/playlists/{playlist_id}/tracks
  - success criteria: retrieve complete tracklist with pagination
  - test: verify track count matches playlist.tracks.total
- [ ] handle track pagination
  - spotify returns max 100 tracks per page
  - success criteria: fetch all pages until next === null
  - test: for playlist with >100 tracks, verify all retrieved
- [ ] extract track metadata
  - required fields: track name, artist names (array), album name, ISRC, duration
  - success criteria: all fields populated for each track
  - test: log track objects, verify no undefined values
- [ ] handle local files and unavailable tracks
  - success criteria: skip local files (track.is_local === true)
  - test: playlists with local files don't cause errors
- [ ] handle podcast episodes
  - success criteria: skip episodes (track.type === 'episode')
  - test: playlists with podcasts only transfer music tracks

## phase 3: spotify to apple music track mapping

### search apple music catalog
- [ ] implement track search function
  - endpoint: GET /v1/catalog/{storefront}/search
  - search params: term="{track} {artist}", types=songs, limit=25
  - success criteria: returns potential matches for spotify track
  - test: search for known track, verify it appears in results
- [ ] get user storefront (region)
  - endpoint: GET /v1/me/storefront
  - success criteria: retrieve user's country code (e.g., "us")
  - test: log storefront, verify it matches user's region
- [ ] implement ISRC-based matching (primary method)
  - endpoint: GET /v1/catalog/{storefront}/songs?filter[isrc]={isrc}
  - success criteria: exact match when ISRC available
  - test: compare spotify ISRC with apple music ISRC, verify match
- [ ] implement fallback search matching
  - when ISRC fails, use track + artist name search
  - success criteria: fuzzy match algorithm finds correct track
  - test: tracks without ISRC still match correctly
- [ ] prioritize explicit versions
  - filter: contentRating === "explicit" in results
  - success criteria: explicit version selected when available
  - test: compare explicit spotify track to apple music match

### matching algorithm
- [ ] implement track similarity scoring
  - compare: track name, artist names, album name, duration
  - success criteria: score >0.85 = confident match
  - test: known matches score >0.85, wrong tracks score <0.7
- [ ] normalize track names for comparison
  - remove: "(feat. ...)", "[Remaster]", special characters
  - lowercase, trim whitespace
  - success criteria: "Song (Remix)" matches "Song - Remix"
  - test: edge cases like "Café" matches "Cafe"
- [ ] handle multi-artist tracks
  - success criteria: match if primary artist matches
  - test: "Song by A, B, C" matches "Song by A"
- [ ] implement duration tolerance
  - success criteria: allow ±5 second difference
  - test: radio edit vs album version still match
- [ ] handle missing tracks gracefully
  - success criteria: track not found doesn't stop entire transfer
  - test: playlist with unavailable track still transfers others

## phase 4: apple music playlist creation

### create playlists
- [ ] create new playlist in apple music library
  - endpoint: POST /v1/me/library/playlists
  - body: { attributes: { name, description }, relationships: { tracks } }
  - success criteria: playlist created with correct name
  - test: verify playlist appears in apple music app
- [ ] preserve playlist metadata
  - transfer: name, description (if available)
  - success criteria: apple music playlist name matches spotify
  - test: special characters in names handled correctly
- [ ] handle playlist name conflicts
  - success criteria: append " (from Spotify)" if name exists
  - test: transferring same playlist twice creates unique names
- [ ] batch track additions
  - apple music limit: 25 tracks per request
  - success criteria: split large playlists into batches of 25
  - test: playlist with 100 tracks requires 4 API calls

### add tracks to playlist
- [ ] add matched tracks to playlist
  - endpoint: POST /v1/me/library/playlists/{id}/tracks
  - body: { data: [{ id, type: "songs" }] }
  - success criteria: all matched tracks added successfully
  - test: track count in apple music matches expected count
- [ ] maintain track order
  - success criteria: track order matches spotify playlist
  - test: compare track #1, #10, #last in both playlists
- [ ] handle rate limiting
  - apple music: ~120 requests/minute
  - success criteria: implement delay between batches if needed
  - test: transferring 500-track playlist doesn't hit rate limit
- [ ] handle duplicate tracks
  - success criteria: add duplicates if they exist in spotify playlist
  - test: spotify playlist with duplicate tracks mirrors in apple music
- [ ] implement retry logic for failed additions
  - success criteria: retry up to 3 times with exponential backoff
  - test: simulate network error, verify retry succeeds

## phase 5: error handling & edge cases

### api error handling
- [ ] handle spotify 401 unauthorized
  - success criteria: trigger token refresh, retry request
  - test: manually expire token, verify auto-recovery
- [ ] handle spotify 429 rate limit
  - success criteria: respect Retry-After header, pause requests
  - test: make rapid requests, verify backoff behavior
- [ ] handle apple music 403 forbidden
  - success criteria: prompt user to re-authorize
  - test: revoke apple music access, verify error message
- [ ] handle apple music 429 rate limit
  - success criteria: queue requests, add delays
  - test: transfer multiple large playlists, verify no 429 errors
- [ ] handle network failures
  - success criteria: show user-friendly error, allow retry
  - test: disable network mid-transfer, verify graceful failure

### data edge cases
- [ ] handle empty playlists
  - success criteria: create empty playlist or skip with warning
  - test: transfer playlist with 0 tracks
- [ ] handle very large playlists (500+ tracks)
  - success criteria: show progress, handle pagination
  - test: transfer playlist with 1000+ tracks
- [ ] handle special characters in names
  - success criteria: preserve emojis, unicode, special chars
  - test: playlist named "🎵 My Playlist & More" transfers correctly
- [ ] handle tracks not available in user's region
  - success criteria: skip unavailable tracks, log for user
  - test: transfer playlist with region-locked tracks
- [ ] handle removed/deleted tracks
  - spotify shows null track objects
  - success criteria: skip null tracks without errors
  - test: playlist with deleted tracks transfers remaining tracks

### user experience edge cases
- [ ] handle user cancellation mid-transfer
  - success criteria: stop gracefully, partial playlist still created
  - test: cancel during track addition, verify partial success
- [ ] handle browser refresh during transfer
  - success criteria: show warning before refresh
  - test: attempt refresh mid-transfer, verify confirmation dialog
- [ ] handle session expiration
  - success criteria: re-authenticate without losing progress
  - test: wait for session timeout, verify re-auth flow
- [ ] handle multiple simultaneous transfers
  - success criteria: queue transfers or prevent overlap
  - test: select 5 playlists, verify sequential processing

## phase 6: user interface & feedback

### progress tracking
- [ ] show overall transfer progress
  - display: "Transferring 3 of 5 playlists"
  - success criteria: real-time progress updates
  - test: progress bar reflects actual completion percentage
- [ ] show per-playlist progress
  - display: "Adding tracks to playlist: 47/120"
  - success criteria: granular track-by-track updates
  - test: UI updates for each track batch added
- [ ] show track matching status
  - display: "Searching for: Track Name by Artist"
  - success criteria: user sees current operation
  - test: user can follow along with matching process
- [ ] implement progress persistence
  - success criteria: progress saved, survives page refresh
  - test: refresh mid-transfer, resume from checkpoint

### success reporting
- [ ] display transfer summary
  - show: total tracks, successful matches, failed matches, playlists created
  - success criteria: accurate counts displayed
  - test: verify counts match actual results
- [ ] show matched vs unmatched tracks
  - display: "95/100 tracks matched, 5 not found"
  - success criteria: clear success metrics
  - test: percentages calculate correctly
- [ ] list unmatched tracks
  - display: table with track name, artist, reason for failure
  - success criteria: user can see what didn't transfer
  - test: UI shows all missing tracks with spotify links
- [ ] provide apple music playlist links
  - success criteria: clickable links open playlists in apple music
  - test: clicking link opens correct playlist in app/web

### error reporting
- [ ] show user-friendly error messages
  - bad: "HTTP 403 Forbidden"
  - good: "Please re-authorize Apple Music access"
  - success criteria: non-technical language
  - test: trigger various errors, verify messages are clear
- [ ] provide retry options
  - success criteria: "Retry" button for failed operations
  - test: failed transfer can be retried without restarting
- [ ] log technical errors for debugging
  - success criteria: errors logged to console with context
  - test: check console logs, verify helpful details included
- [ ] offer fallback options
  - example: "Some tracks couldn't be matched. Continue anyway?"
  - success criteria: user can proceed with partial success
  - test: transfer with unmatchable tracks still completes

## phase 7: testing & validation

### unit tests
- [ ] test track matching algorithm
  - test cases: exact match, fuzzy match, no match, multi-artist
  - success criteria: >95% accuracy on test dataset
  - test: run against 100 known track pairs
- [ ] test name normalization
  - test cases: special chars, unicode, remixes, features
  - success criteria: all edge cases handled correctly
  - test: "Song (feat. X)" === "Song - feat. X"
- [ ] test pagination logic
  - test cases: 0 items, 50 items, 101 items, 1000 items
  - success criteria: all items retrieved, no duplicates
  - test: mock API responses with various page counts
- [ ] test batch splitting
  - test cases: 0 tracks, 10 tracks, 25 tracks, 100 tracks
  - success criteria: correct number of batches, no missing tracks
  - test: 77 tracks = 4 batches (25+25+25+2)
- [ ] test error retry logic
  - test cases: 1 failure, 3 failures, permanent failure
  - success criteria: retries work, gives up after max attempts
  - test: mock failing API, verify retry behavior

### integration tests
- [ ] test spotify authentication flow
  - success criteria: end-to-end auth completes
  - test: run auth in test environment, verify token received
- [ ] test apple music authentication flow
  - success criteria: musickit initializes, user authorizes
  - test: run auth flow, verify isAuthorized = true
- [ ] test playlist retrieval
  - success criteria: real playlists fetched from test account
  - test: spotify test account with 3 playlists, verify all retrieved
- [ ] test track search and matching
  - success criteria: real tracks found in apple music
  - test: search for "Bohemian Rhapsody", verify match
- [ ] test playlist creation
  - success criteria: playlist created in apple music test account
  - test: create playlist via API, verify in apple music app

### end-to-end tests
- [ ] test single playlist transfer (small)
  - setup: spotify playlist with 10 tracks
  - success criteria: all 10 tracks transfer correctly
  - test: verify apple music playlist has 10 tracks, same order
- [ ] test single playlist transfer (large)
  - setup: spotify playlist with 200+ tracks
  - success criteria: all tracks transfer, no timeout
  - test: verify track count matches, check first and last track
- [ ] test multiple playlist transfer
  - setup: select 3 spotify playlists
  - success criteria: all 3 playlists created in apple music
  - test: verify 3 new playlists exist with correct names
- [ ] test transfer with unmatchable tracks
  - setup: playlist with obscure/region-locked tracks
  - success criteria: transfer completes, shows unmatched list
  - test: verify partial success, error report accurate
- [ ] test transfer with explicit content
  - setup: playlist with explicit and clean versions
  - success criteria: explicit versions preferred
  - test: check contentRating in apple music, verify explicit

### performance tests
- [ ] measure track matching speed
  - success criteria: <2 seconds per track average
  - test: time 100 track matches, calculate average
- [ ] measure playlist creation speed
  - success criteria: <5 seconds for 25-track playlist
  - test: time full playlist creation including API calls
- [ ] measure large transfer performance
  - success criteria: 500-track playlist in <10 minutes
  - test: transfer large playlist, time end-to-end
- [ ] test concurrent playlist transfers
  - success criteria: 3 playlists simultaneously without crashes
  - test: select 3 playlists, transfer in parallel
- [ ] test rate limit handling
  - success criteria: no 429 errors during rapid transfers
  - test: transfer 10 playlists back-to-back

## phase 8: deployment & monitoring

### pre-deployment checklist
- [ ] verify all netlify environment variables set
  - required: SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_P8_KEY
  - success criteria: netlify env:list shows all variables
  - test: netlify dev loads all variables without errors
- [ ] verify OAuth redirect URIs configured
  - spotify: https://your-site.netlify.app/callback
  - success criteria: spotify developer dashboard has correct URI
  - test: auth flow completes on production URL
- [ ] test on staging/preview deploy
  - success criteria: full transfer works on deploy preview
  - test: create PR, test on preview URL
- [ ] verify CORS headers for APIs
  - success criteria: no CORS errors in production
  - test: make API calls from production site, check network tab
- [ ] check production bundle size
  - success criteria: main bundle <500kb, loads in <3s
  - test: run lighthouse, verify performance score >90

### monitoring & logging
- [ ] implement error tracking
  - tool: sentry, rollbar, or console logging
  - success criteria: errors logged with context
  - test: trigger error, verify it's captured
- [ ] implement analytics events
  - track: playlist_transfer_started, transfer_completed, transfer_failed
  - success criteria: events fire correctly
  - test: complete transfer, verify events logged
- [ ] log transfer statistics
  - track: tracks matched, tracks failed, time taken
  - success criteria: metrics available for analysis
  - test: review logs, verify useful data captured
- [ ] monitor API rate limits
  - success criteria: dashboard shows API usage
  - test: check spotify/apple music quotas regularly
- [ ] set up uptime monitoring
  - success criteria: alerts if site goes down
  - test: simulate downtime, verify alert received

## acceptance criteria (must pass all)

### functional requirements
- [ ] user can authorize both spotify and apple music
- [ ] user can view all their spotify playlists
- [ ] user can select one or more playlists to transfer
- [ ] system matches >90% of tracks successfully
- [ ] explicit versions are prioritized when available
- [ ] playlists are created in apple music library
- [ ] track order is preserved
- [ ] user sees real-time progress updates
- [ ] user sees summary of successful/failed matches
- [ ] unmatched tracks are listed with details

### non-functional requirements
- [ ] transfer completes in reasonable time (<1 min per 100 tracks)
- [ ] UI is responsive and doesn't freeze during transfer
- [ ] no data loss if transfer is interrupted
- [ ] errors are handled gracefully with user-friendly messages
- [ ] works on desktop and mobile browsers
- [ ] works with large playlists (tested up to 1000 tracks)
- [ ] no security vulnerabilities (tokens stored securely)
- [ ] accessible (keyboard navigation, screen reader support)

## success metrics

### quantitative
- track match accuracy: >90%
- transfer success rate: >95% of playlists transfer completely
- average transfer time: <30 seconds per 50 tracks
- error rate: <5% of API calls fail
- user satisfaction: based on feedback/ratings

### qualitative
- user can complete transfer without documentation
- error messages are clear and actionable
- progress feedback keeps user informed
- transfer results meet user expectations
- no unexpected behavior or bugs
