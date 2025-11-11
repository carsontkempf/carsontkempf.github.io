#!/usr/bin/env bash

echo "--- Starting Apple Music Auth Test ---"

# 1. Get Netlify Site URL
echo "Fetching Netlify site URL..."
NETLIFY_URL=$(netlify status | grep -o 'https://[^[:space:]]*netlify\.app')

if [ -z "$NETLIFY_URL" ]; then
    echo "ERROR: Could not get Netlify URL. Run 'netlify link'."
    exit 1
fi

echo "Site URL: $NETLIFY_URL"
FUNCTION_URL="$NETLIFY_URL/.netlify/functions/get-token"

# 2. Fetch the Developer Token
echo "Fetching token from $FUNCTION_URL ..."
JSON_RESPONSE=$(curl -s $FUNCTION_URL)

# 3. Parse the Token (Pure Bash/sed)
TOKEN=$(echo $JSON_RESPONSE | sed -e 's/{"token":"//' -e 's/"}//') 

if [[ "$JSON_RESPONSE" != *"token"* ]]; then
    echo "ERROR: Failed to get token from function."
    echo "Function Response: $JSON_RESPONSE"
    echo "---"
    echo "RUN 'netlify logs --function get-token' TO DEBUG."
    echo "---"
    exit 1
fi

echo "Token successfully retrieved."

# 4. Authenticate against Apple Music API
API_ENDPOINT="https://api.music.apple.com/v1/catalog/us/search?term=test&limit=1"

echo "Testing connection to Apple Music API..."

# Use curl -i to get headers, head -n 1 to get the HTTP status line
HTTP_STATUS=$(curl -s -i -H "Authorization: Bearer $TOKEN" "$API_ENDPOINT" | head -n 1)

# 5. Verify the Result
if [[ "$HTTP_STATUS" == *"HTTP/2 200"* ]] || [[ "$HTTP_STATUS" == *"HTTP/1.1 200"* ]]; then
    echo "----------------------------------------"
    echo "✅ SUCCESS: Authorization Guaranteed."
    echo "HTTP Status: 200 OK"
    echo "----------------------------------------"
else
    echo "----------------------------------------"
    echo "❌ FAILURE: Authorization Failed."
    echo "HTTP Status: $HTTP_STATUS"
    echo "----------------------------------------"
    echo "Debug Info:"
    echo "Token (first 10 chars): ${TOKEN:0:10}..."
    echo "If status is 403, your Apple Keys (ID, Team, or .p8) are likely incorrect in Netlify ENV."
fi