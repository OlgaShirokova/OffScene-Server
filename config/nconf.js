const nconf = require('nconf');

nconf.argv().env().file({ file: 'config/env.json' });

module.exports = nconf;
