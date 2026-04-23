from flask import Flask, request, jsonify, send_from_directory, Response
import requests
import re
import os

from functools import wraps

app = Flask(__name__, static_folder='.')

# --- SÉCURITÉ PRIVÉE ---
# Définissez une variable d'environnement "APP_PASSWORD" sur Render.
# Si elle n'est pas définie, le mot de passe par défaut sera "studio2026"
ACCESS_PASSWORD = os.environ.get('APP_PASSWORD', 'studio2026')

def requires_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        if not auth or not (auth.password == ACCESS_PASSWORD):
            return Response(
                'Accès restreint. Veuillez entrer le mot de passe.', 401,
                {'WWW-Authenticate': 'Basic realm="X-Post Studio Login"'}
            )
        return f(*args, **kwargs)
    return decorated

@app.route('/')
@requires_auth
def index():
    return send_from_directory('.', 'index.html')

# Standard browser headers to avoid 403 Forbidden / Authorization issues
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

@app.route('/api/fetch-tweet')
@requires_auth
def fetch_tweet():
    tweet_url = request.args.get('url')
    if not tweet_url:
        return jsonify({'error': 'No URL provided'}), 400

    # Extract ID from URL
    match = re.search(r'status/(\d+)', tweet_url)
    if not match:
        return jsonify({'error': 'Invalid URL format'}), 400
    
    tweet_id = match.group(1)
    
    # Use api.fxtwitter.com
    api_url = f"https://api.fxtwitter.com/status/{tweet_id}"
    print(f"Fetching from: {api_url}")
    try:
        resp = requests.get(api_url, headers=HEADERS, timeout=10)
        print(f"FXTwitter Response: {resp.status_code}")
        
        if resp.status_code != 200:
            print(f"API Error: Received status {resp.status_code}")
            return jsonify({'success': False, 'message': f'L\'API a renvoyé une erreur {resp.status_code}'}), 200

        data = resp.json()
        if data and data.get('code') == 200 and 'tweet' in data:
            tweet = data['tweet']
            # Extract media if exists (photo or video thumbnail)
            media_url = None
            if 'media' in tweet and tweet['media'] and 'all' in tweet['media'] and len(tweet['media']['all']) > 0:
                first_media = tweet['media']['all'][0]
                if first_media.get('type') == 'photo':
                    media_url = first_media.get('url')
                elif first_media.get('type') in ['video', 'gif']:
                    media_url = first_media.get('thumbnail_url')
            
            return jsonify({
                'author_name': tweet.get('author', {}).get('name', 'Unknown'),
                'author_handle': tweet.get('author', {}).get('screen_name', 'unknown'),
                'avatar_url': tweet.get('author', {}).get('avatar_url'),
                'content': tweet.get('text', ''),
                'media_url': media_url,
                'success': True
            })
        else:
            print(f"API Error Content: {data}")
            return jsonify({'success': False, 'message': 'L\'API a renvoyé des données invalides ou le tweet n\'existe pas.'}), 200
    except Exception as e:
        print(f"Error fetching from FXTwitter: {e}")
        return jsonify({'success': False, 'message': f'Erreur serveur : {str(e)}'}), 200
    
    return jsonify({'success': False, 'message': 'Erreur inconnue lors de la récupération.'}), 200

@app.route('/proxy')
@app.route('/api/proxy')
@requires_auth
def proxy_image():
    url = request.args.get('url')
    if not url:
        return 'Missing URL', 400
    
    try:
        print(f"Proxying image: {url}")
        # Force verify=False for local environments to avoid any SSL certificate issues
        resp = requests.get(url, headers=HEADERS, timeout=15, verify=False)
        
        proxy_resp = Response(
            resp.content,
            status=resp.status_code,
            content_type=resp.headers.get('Content-Type', 'image/png')
        )
        proxy_resp.headers['Access-Control-Allow-Origin'] = '*'
        proxy_resp.headers['Access-Control-Allow-Methods'] = '*'
        proxy_resp.headers['Access-Control-Allow-Headers'] = '*'
        return proxy_resp
    except Exception as e:
        print(f"Critical Proxy error for {url}: {e}")
        transparent_pixel = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82'
        return Response(transparent_pixel, status=200, content_type='image/png', headers={'Access-Control-Allow-Origin': '*'})

@app.route('/<path:path>')
def send_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"--- SERVEUR X-POST STUDIO DÉMARRÉ SUR LE PORT {port} ---")
    app.run(debug=False, port=port, host='0.0.0.0')
