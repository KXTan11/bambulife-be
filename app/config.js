var fs = require('fs');
var currentEnv = 'development';
if (process.env.NODE_ENV) {
    if (fs.existsSync(global.__dirname  + '/app/env/' + process.env.NODE_ENV + '.js')) {
        currentEnv = process.env.NODE_ENV;
    }
}
module.exports = require(global.__dirname  + '/app/env/' + currentEnv + '.js');