All of our styles are located in /_sass/_jekyll-theme-minimal.scss, it should be the only one that is edited for this program's development.

Here is spotify documentation for get playlist items:
"
Get Playlist Items


OAuth 2.0
Get full details of the items of a playlist owned by a Spotify user.

Important policy notes
Spotify content may not be downloaded
Keep visual content in its original form
Ensure content attribution
Spotify content may not be used to train machine learning or AI model
Please note that you can not use the Spotify Platform or any Spotify Content to train a machine learning or AI model or otherwise ingesting Spotify Content into a machine learning or AI model.
More information

Authorization scopes
playlist-read-private
Request

GET
/playlists/{playlist_id}/tracks
playlist_id
string
Required
The Spotify ID of the playlist.
Example: 3cEYpjA9oz9GiPac4AsH4n
market
string
An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
Note: If neither market or user country are provided, the content is considered unavailable for the client.
Users can view the country that is associated with their account in the account settings.
Example: market=ES
fields
string
Filters for the query: a comma-separated list of the fields to return. If omitted, all fields are returned. For example, to get just the total number of items and the request limit:
fields=total,limit
A dot separator can be used to specify non-reoccurring fields, while parentheses can be used to specify reoccurring fields within objects. For example, to get just the added date and user ID of the adder:
fields=items(added_at,added_by.id)
Use multiple parentheses to drill down into nested objects, for example:
fields=items(track(name,href,album(name,href)))
Fields can be excluded by prefixing them with an exclamation mark, for example:
fields=items.track.album(!external_urls,images)
Example: fields=items(added_by.id,track(name,href,album(name,href)))
limit
integer
The maximum number of items to return. Default: 20. Minimum: 1. Maximum: 50.
Default: limit=20
Range: 0 - 50
Example: limit=10
offset
integer
The index of the first item to return. Default: 0 (the first item). Use with limit to get the next set of items.
Default: offset=0
Example: offset=5
additional_types
string
A comma-separated list of item types that your client supports besides the default track type. Valid types are: track and episode.
Note: This parameter was introduced to allow existing clients to maintain their current behaviour and might be deprecated in the future.
In addition to providing this parameter, make sure that your client properly handles cases of new types in the future by checking against the type field of each object.
Response
200
401
403
429
Pages of tracks
href
string
Required
A link to the Web API endpoint returning the full result of the request
Example: "https://api.spotify.com/v1/me/shows?offset=0&limit=20"
limit
integer
Required
The maximum number of items in the response (as set in the query or by default).
Example: 20
next
string
Required
Nullable
URL to the next page of items. ( null if none)
Example: "https://api.spotify.com/v1/me/shows?offset=1&limit=1"
offset
integer
Required
The offset of the items returned (as set in the query or by default)
Example: 0
previous
string
Required
Nullable
URL to the previous page of items. ( null if none)
Example: "https://api.spotify.com/v1/me/shows?offset=1&limit=1"
total
integer
Required
The total number of items available to return.
Example: 4

items
array of PlaylistTrackObject
Required
added_at
string [date-time]
The date and time the track or episode was added. Note: some very old playlists may return null in this field.

added_by
object
The Spotify user who added the track or episode. Note: some very old playlists may return null in this field.
is_local
boolean
Whether this track or episode is a local file or not.
track
oneOf
Information about the track or episode.
Will be one of the following:

TrackObject
object

album
object
The album on which the track appears. The album object includes a link in href to full information about the album.

artists
array of SimplifiedArtistObject
The artists who performed the track. Each artist object includes a link in href to more detailed information about the artist.
available_markets
array of strings
A list of the countries in which the track can be played, identified by their ISO 3166-1 alpha-2 code.
disc_number
integer
The disc number (usually 1 unless the album consists of more than one disc).
duration_ms
integer
The track length in milliseconds.
explicit
boolean
Whether or not the track has explicit lyrics ( true = yes it does; false = no it does not OR unknown).

external_ids
object
Known external IDs for the track.

external_urls
object
Known external URLs for this track.
href
string
A link to the Web API endpoint providing full details of the track.
id
string
The Spotify ID for the track.
is_playable
boolean
Part of the response when Track Relinking is applied. If true, the track is playable in the given market. Otherwise false.

linked_from
object
Part of the response when Track Relinking is applied, and the requested track has been replaced with different track. The track in the linked_from object contains information about the originally requested track.

restrictions
object
Included in the response when a content restriction is applied.
name
string
The name of the track.
popularity
integer
The popularity of the track. The value will be between 0 and 100, with 100 being the most popular.
The popularity of a track is a value between 0 and 100, with 100 being the most popular. The popularity is calculated by algorithm and is based, in the most part, on the total number of plays the track has had and how recent those plays are.
Generally speaking, songs that are being played a lot now will have a higher popularity than songs that were played a lot in the past. Duplicate tracks (e.g. the same track from a single and an album) are rated independently. Artist and album popularity is derived mathematically from track popularity. Note: the popularity value may lag actual popularity by a few days: the value is not updated in real time.
preview_url
string
Nullable
Deprecated
A link to a 30 second preview (MP3 format) of the track. Can be null

Important policy note
Spotify Audio preview clips can not be a standalone service
track_number
integer
The number of the track. If an album has several discs, the track number is the number on the specified disc.
type
string
The object type: "track".
Allowed values: "track"
uri
string
The Spotify URI for the track.
is_local
boolean
Whether or not the track is from a local file.

EpisodeObject
object

" 

here is get playlist spotify api information:
"
Get Playlist


OAuth 2.0
Get a playlist owned by a Spotify user.

Important policy notes
Spotify content may not be downloaded
Keep visual content in its original form
Ensure content attribution
Spotify content may not be used to train machine learning or AI model
Request

GET
/playlists/{playlist_id}
playlist_id
string
Required
The Spotify ID of the playlist.
Example: 3cEYpjA9oz9GiPac4AsH4n
market
string
An ISO 3166-1 alpha-2 country code. If a country code is specified, only content that is available in that market will be returned.
If a valid user access token is specified in the request header, the country associated with the user account will take priority over this parameter.
Note: If neither market or user country are provided, the content is considered unavailable for the client.
Users can view the country that is associated with their account in the account settings.
Example: market=ES
fields
string
Filters for the query: a comma-separated list of the fields to return. If omitted, all fields are returned. For example, to get just the playlist''s description and URI: fields=description,uri. A dot separator can be used to specify non-reoccurring fields, while parentheses can be used to specify reoccurring fields within objects. For example, to get just the added date and user ID of the adder: fields=tracks.items(added_at,added_by.id). Use multiple parentheses to drill down into nested objects, for example: fields=tracks.items(track(name,href,album(name,href))). Fields can be excluded by prefixing them with an exclamation mark, for example: fields=tracks.items(track(name,href,album(!name,href)))
Example: fields=items(added_by.id,track(name,href,album(name,href)))
additional_types
string
A comma-separated list of item types that your client supports besides the default track type. Valid types are: track and episode.
Note: This parameter was introduced to allow existing clients to maintain their current behaviour and might be deprecated in the future.
In addition to providing this parameter, make sure that your client properly handles cases of new types in the future by checking against the type field of each object.
Response
200
401
403
429
A playlist
collaborative
boolean
true if the owner allows other users to modify the playlist.
description
string
Nullable
The playlist description. Only returned for modified, verified playlists, otherwise null.

external_urls
object
Known external URLs for this playlist.
spotify
string
The Spotify URL for the object.
href
string
A link to the Web API endpoint providing full details of the playlist.
id
string
The Spotify ID for the playlist.

images
array of ImageObject
Images for the playlist. The array may be empty or contain up to three images. The images are returned by size in descending order. See Working with Playlists. Note: If returned, the source URL for the image (url) is temporary and will expire in less than a day.
url
string
Required
The source URL of the image.
Example: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228"
height
integer
Required
Nullable
The image height in pixels.
Example: 300
width
integer
Required
Nullable
The image width in pixels.
Example: 300
name
string
The name of the playlist.

owner
object
The user who owns the playlist

external_urls
object
Known public external URLs for this user.
href
string
A link to the Web API endpoint for this user.
id
string
The Spotify user ID for this user.
type
string
The object type.
Allowed values: "user"
uri
string
The Spotify URI for this user.
display_name
string
Nullable
The name displayed on the user's profile. null if not available.
public
boolean
The playlist's public/private status (if it is added to the user's profile): true the playlist is public, false the playlist is private, null the playlist status is not relevant. For more about public/private status, see Working with Playlists
snapshot_id
string
The version identifier for the current playlist. Can be supplied in other requests to target a specific playlist version

tracks
object
The tracks of the playlist.
href
string
Required
A link to the Web API endpoint returning the full result of the request
Example: "https://api.spotify.com/v1/me/shows?offset=0&limit=20"
limit
integer
Required
The maximum number of items in the response (as set in the query or by default).
Example: 20
next
string
Required
Nullable
URL to the next page of items. ( null if none)
Example: "https://api.spotify.com/v1/me/shows?offset=1&limit=1
"

Here is user authentication documentation for spotify:
"
Authorization
Authorization refers to the process of granting a user or application access permissions to Spotify data and features (e.g your application needs permission from a user to access their playlists).
Spotify implements the OAuth 2.0 authorization framework:
Auth Intro
Where:
End User corresponds to the Spotify user. The End User grants access to the protected resources (e.g. playlists, personal information, etc.)
My App is the client that requests access to the protected resources (e.g. a mobile or web app).
Server which hosts the protected resources and provides authentication and authorization via OAuth 2.0.
The access to the protected resources is determined by one or several scopes. Scopes enable your application to access specific functionality (e.g. read a playlist, modify your library or just streaming) on behalf of a user. The set of scopes you set during the authorization, determines the access permissions that the user is asked to grant. You can find detailed information about scopes in the scopes documentation.
The authorization process requires valid client credentials: a client ID and a client secret. You can follow the Apps guide to learn how to generate them.
Once the authorization is granted, the authorization server issues an access token, which is used to make API calls on behalf the user or application.
The OAuth2 standard defines four grant types (or flows) to request and get an access token. Spotify implements the following ones:
Authorization code
Authorization code with PKCE extension
Client credentials
Implicit grant

The implicit grant is deprecated and will be removed in the future. To learn more about the deprecation, see this blog post .
Which OAuth flow should I use?
Choosing one flow over the rest depends on the application you are building:
If you are developing a long-running application (e.g. web app running on the server) in which the user grants permission only once, and the client secret can be safely stored, then the authorization code flow is the recommended choice.
In scenarios where storing the client secret is not safe (e.g. desktop, mobile apps or JavaScript web apps running in the browser), you can use the authorization code with PKCE, as it provides protection against attacks where the authorization code may be intercepted.
For some applications running on the backend, such as CLIs or daemons, the system authenticates and authorizes the app rather than a user. For these scenarios, Client credentials is the typical choice. This flow does not include user authorization, so only endpoints that do not request user information (e.g. user profile data) can be accessed.
The implicit grant has some important downsides: it returns the token in the URL instead of a trusted channel, and does not support refresh token. Thus, we don't recommend using this flow.
The following table summarizes the flows' behaviors:
FLOW	Access User Resources	Requires Secret Key (Server-Side)	Access Token Refresh
Authorization code	Yes	Yes	Yes
Authorization code with PKCE	Yes	No	Yes
Client credentials	No	Yes	No
Implicit grant	Yes	No	No
"