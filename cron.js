const cron = require('node-cron')
const cp = require('child_process')

cron.schedule('0 */4 * * *', () => {
  console.log('Running');
  cp.fork(__dirname + '/index.js')
});
