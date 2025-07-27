const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
const talentaRoutes = require("./lib/routes")
app.use("/api/talenta", talentaRoutes)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Talenta API is running",
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  })
})

app.listen(PORT, () => {
  console.log(`Talenta API server is running on port ${PORT}`)
})

module.exports = app
