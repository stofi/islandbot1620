const CronJob = require('cron').CronJob
const bot = require('./bot.js')


const job = new CronJob({
    cronTime: "* */4 * * * *",
    onTick: bot(),
    start: true,
    timeZone: "Europe/Prague"
})

job.start()
