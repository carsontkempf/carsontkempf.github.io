// Spotify anonymous token proxy
// Fetches a web-player guest token from Spotify (server-side to bypass CORS)

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': 'https://carsontkempf.github.io',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

exports.handler = async function(event) {
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 204, headers: CORS_HEADERS, body: '' };
    }

    try {
        const resp = await fetch(
            'https://open.spotify.com/get_access_token?reason=transport&productType=web_player',
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                    'Referer': 'https://open.spotify.com/',
                    'Origin': 'https://open.spotify.com',
                }
            }
        );

        if (!resp.ok) {
            return {
                statusCode: 502,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: `Spotify token endpoint returned ${resp.status}` })
            };
        }

        const data = await resp.json();
        return {
            statusCode: 200,
            headers: { ...CORS_HEADERS, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
            body: JSON.stringify(data)
        };
    } catch (err) {
        return {
            statusCode: 500,
            headers: CORS_HEADERS,
            body: JSON.stringify({ error: err.message })
        };
    }
};
