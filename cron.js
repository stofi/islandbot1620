const cron = require('node-cron')
const cp = require('child_process')

cron.schedule('0 9,13,17,21 * * *', () => {
  console.log('Running');
  cp.fork(__dirname + '/index.js')
});
