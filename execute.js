const { spawn } = require("child_process")
const path = require("path")

class ProcessExecutor {
  constructor() {
    this.processes = new Map()
  }

  execute(command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args, {
        stdio: "pipe",
        ...options,
      })

      let stdout = ""
      let stderr = ""

      process.stdout.on("data", (data) => {
        stdout += data.toString()
      })

      process.stderr.on("data", (data) => {
        stderr += data.toString()
      })

      process.on("close", (code) => {
        if (code === 0) {
          resolve({
            success: true,
            stdout,
            stderr,
            code,
          })
        } else {
          reject({
            success: false,
            stdout,
            stderr,
            code,
          })
        }
      })

      process.on("error", (error) => {
        reject({
          success: false,
          error: error.message,
        })
      })
    })
  }

  async startServer() {
    try {
      console.log("Starting Talenta API server...")
      const result = await this.execute("node", ["start.js"])
      console.log("Server started successfully")
      return result
    } catch (error) {
      console.error("Failed to start server:", error)
      throw error
    }
  }

  async stopServer() {
    try {
      console.log("Stopping Talenta API server...")
      const result = await this.execute("node", ["stop.js"])
      console.log("Server stopped successfully")
      return result
    } catch (error) {
      console.error("Failed to stop server:", error)
      throw error
    }
  }

  async runTests() {
    try {
      console.log("Running tests...")
      const result = await this.execute("npm", ["test"])
      console.log("Tests completed successfully")
      return result
    } catch (error) {
      console.error("Tests failed:", error)
      throw error
    }
  }
}

module.exports = new ProcessExecutor()
