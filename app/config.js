var fs = require('fs');
var currentEnv = 'development';
if (process.env.NODE_ENV) {
    if (fs.existsSync('./env/' + process.env.NODE_ENV + '.js')) {
        currentEnv = process.env.NODE_ENV;
    }
}
module.exports = require('./env/' + currentEnv + '.js');