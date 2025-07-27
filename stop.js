const fs = require("fs")
const path = require("path")

const pidFile = path.join(__dirname, "talenta-api.pid")

if (fs.existsSync(pidFile)) {
  const pid = fs.readFileSync(pidFile, "utf8")

  try {
    process.kill(pid, "SIGTERM")
    console.log(`Stopped Talenta API process ${pid}`)
    fs.unlinkSync(pidFile)
  } catch (error) {
    console.error("Error stopping process:", error.message)
    // Remove stale PID file
    fs.unlinkSync(pidFile)
  }
} else {
  console.log("No PID file found. Server may not be running.")
}
