# apple music .p8 key setup

## obtaining the .p8 file from apple

1. go to apple developer portal
   - visit: https://developer.apple.com/account

2. navigate to certificates, identifiers & profiles
   - click on "keys" in the left sidebar

3. create a new key
   - click the "+" button to create a new key
   - give it a name (e.g., "musickit key")
   - enable "musickit"
   - click "continue"

4. register the key
   - review the key configuration
   - click "register"

5. download the .p8 file
   - click "download" to get the .p8 file
   - apple only lets you download this once, so save it securely
   - the filename format: AuthKey_XXXXXXXXXX.p8 (where X is your key id)

6. note important values
   - key id: 10-character string (shown in portal and in filename)
   - team id: found in top-right of developer portal or membership section
   - both needed for apple music api authentication

## placing the file in this project

1. save the .p8 file to this directory: `_data/`
   - recommended name: `_data/AuthKey_XXXXXXXXXX.p8`
   - or: `_data/apple-music-key.p8`

2. the .p8 file is already in .gitignore
   - it will never be committed to git
   - safe to place in this directory

3. update your configuration
   - ensure key id and team id are in your env config
   - typically stored in _config.yml or environment variables

## security notes

- never commit .p8 files to version control
- never share .p8 files publicly
- store securely and back up safely
- if compromised, revoke key in apple developer portal and create new one
