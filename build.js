var fs = require('fs');

var key = process.env.YOUTUBE_API_KEY || 'YOUR_KEY_HERE';

var content = 'var APP_CONFIG = {\n  YOUTUBE_API_KEY: \'' + key + '\'\n};\n';

fs.writeFileSync('js/config.js', content);
console.log('config.js generated');
