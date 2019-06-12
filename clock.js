const CronJob = require('cron').CronJob
const bot = require('./bot.js')


const job = new CronJob({
    cronTime: "0 */4 * * * *",
    onTick: bot(),
    timeZone: "Europe/Prague"
})

job.start()
