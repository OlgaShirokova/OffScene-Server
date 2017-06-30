const nconf = require('nconf');

let file = 'config/env.json';

if (process.env.NODE_ENV === 'testing') file = 'config/test.json';

nconf.argv().env().file({ file });

module.exports = nconf;
