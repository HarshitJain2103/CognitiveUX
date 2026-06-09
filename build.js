var fs = require('fs');

var key = process.env.YOUTUBE_API_KEY || '';

console.log('YOUTUBE_API_KEY found:', key ? 'yes (' + key.length + ' chars)' : 'NO - env var missing!');

var content = 'var APP_CONFIG = {\n  YOUTUBE_API_KEY: ' + JSON.stringify(key) + '\n};\n';

fs.writeFileSync('js/config.js', content, 'utf8');
console.log('js/config.js written successfully');
console.log('Contents:', content);
