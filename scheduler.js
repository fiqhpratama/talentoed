const cron = require("node-cron")
const axios = require("axios")

class Scheduler {
  constructor() {
    this.jobs = new Map()
  }

  start() {
    console.log("Starting scheduler...")

    // Daily attendance report at 6 PM
    this.scheduleJob("daily-report", "0 18 * * *", this.generateDailyReport)

    // Weekly attendance summary on Sunday at 8 PM
    this.scheduleJob("weekly-summary", "0 20 * * 0", this.generateWeeklySummary)

    // Monthly attendance report on the 1st of each month at 9 AM
    this.scheduleJob("monthly-report", "0 9 1 * *", this.generateMonthlyReport)

    console.log("Scheduler started successfully")
  }

  scheduleJob(name, cronExpression, task) {
    const job = cron.schedule(cronExpression, task, {
      scheduled: false,
      timezone: process.env.TIMEZONE || "Asia/Jakarta",
    })

    this.jobs.set(name, job)
    job.start()
    console.log(`Scheduled job: ${name} with expression: ${cronExpression}`)
  }

  async generateDailyReport() {
    try {
      console.log("Generating daily attendance report...")
      // Implementation for daily report generation
      // This would typically call your reporting API or send notifications
    } catch (error) {
      console.error("Error generating daily report:", error)
    }
  }

  async generateWeeklySummary() {
    try {
      console.log("Generating weekly attendance summary...")
      // Implementation for weekly summary generation
    } catch (error) {
      console.error("Error generating weekly summary:", error)
    }
  }

  async generateMonthlyReport() {
    try {
      console.log("Generating monthly attendance report...")
      // Implementation for monthly report generation
    } catch (error) {
      console.error("Error generating monthly report:", error)
    }
  }

  stop() {
    console.log("Stopping scheduler...")
    this.jobs.forEach((job, name) => {
      job.stop()
      console.log(`Stopped job: ${name}`)
    })
    this.jobs.clear()
    console.log("Scheduler stopped")
  }
}

module.exports = new Scheduler()
