var path = require('path');
global.__dirname = path.resolve(__dirname+'/../');
require('./initialiseDb.js')()
.then(function() {
    return require('./populateDb.js')(require('./data.js'));
})
.asCallback(function(err) {
    if (err) {
        console.error(err);
    }
    process.exit(err ? -1 : 0);
});