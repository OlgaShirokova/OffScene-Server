import nconf from 'nconf';

nconf.argv().env().file({
  file: process.env.NODE_ENV === 'testing'
    ? 'config/test.json'
    : 'config/env.json',
});

export default nconf;
