const cluster = require("cluster")
const os = require("os")
const scheduler = require("./scheduler")

if (cluster.isMaster) {
  const numCPUs = os.cpus().length

  console.log(`Master ${process.pid} is running`)
  console.log(`Starting ${numCPUs} workers...`)

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  // Start scheduler only in master process
  scheduler.start()

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    console.log("Starting a new worker...")
    cluster.fork()
  })

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received, shutting down gracefully")
    scheduler.stop()

    for (const id in cluster.workers) {
      cluster.workers[id].kill()
    }

    process.exit(0)
  })
} else {
  // Worker process
  require("./index")
  console.log(`Worker ${process.pid} started`)
}
