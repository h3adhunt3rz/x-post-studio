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
# ... (rest of function)

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
