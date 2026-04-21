import requests
import json
import re

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
}

url = "https://x.com/D7s30/status/2046495048481546680?s=20"
match = re.search(r'status/(\d+)', url)
tweet_id = match.group(1)
api_url = f"https://api.fxtwitter.com/status/{tweet_id}"

print(f"Fetching {api_url}...")
try:
    resp = requests.get(api_url, headers=HEADERS, timeout=10)
    print(f"Status: {resp.status_code}")
    data = resp.json()
    if data and data.get('code') == 200 and 'tweet' in data:
        tweet = data['tweet']
        result = {
            'author_name': tweet.get('author', {}).get('name', 'Unknown'),
            'author_handle': tweet.get('author', {}).get('screen_name', 'unknown'),
            'avatar_url': tweet.get('author', {}).get('avatar_url'),
            'content': tweet.get('text', ''),
            'success': True
        }
        print(json.dumps(result, indent=2))
    else:
        print("API failed match logic")
        print(data)
except Exception as e:
    print(f"Error: {e}")
