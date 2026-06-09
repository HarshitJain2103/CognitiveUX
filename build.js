// Build script - reads .env or Vercel env vars and generates config.js
var fs = require('fs');

// try reading from .env file first (local dev), fallback to process.env (Vercel)
var key = process.env.YOUTUBE_API_KEY || '';

if (!key) {
  try {
    var envFile = fs.readFileSync('.env', 'utf8');
    var lines = envFile.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (line.startsWith('YOUTUBE_API_KEY=')) {
        key = line.split('=').slice(1).join('=').trim();
        break;
      }
    }
  } catch (e) {
    // .env file doesn't exist, that's fine on Vercel
  }
}

var output = 'var APP_CONFIG = {\n  YOUTUBE_API_KEY: ' + JSON.stringify(key) + '\n};\n';
fs.writeFileSync('js/config.js', output, 'utf8');
console.log('config.js generated, key length:', key.length);
