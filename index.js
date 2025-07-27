const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

// Initialize express app
const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
)
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(",") : "*",
    credentials: true,
  }),
)
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Routes
const talentaRoutes = require("./lib/routes")
app.use("/api/talenta", talentaRoutes)

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "Talenta API",
    version: "1.0.0",
    description: "API HR Talenta for ClockIn and ClockOut",
    endpoints: {
      health: "/health",
      clockin: "/api/talenta/clockin",
      clockout: "/api/talenta/clockout",
      attendance: "/api/talenta/attendance/:employeeId",
      summary: "/api/talenta/attendance/:employeeId/summary",
    },
    documentation: "https://github.com/ans-4175/talenta-api",
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Talenta API is running on Vercel",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
  })
})

// API documentation endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "Talenta API Documentation",
    version: "1.0.0",
    endpoints: [
      {
        method: "POST",
        path: "/api/talenta/clockin",
        description: "Clock in employee",
        body: {
          employeeId: "string (required)",
          latitude: "number (optional)",
          longitude: "number (optional)",
          notes: "string (optional)",
        },
      },
      {
        method: "POST",
        path: "/api/talenta/clockout",
        description: "Clock out employee",
        body: {
          employeeId: "string (required)",
          latitude: "number (optional)",
          longitude: "number (optional)",
          notes: "string (optional)",
        },
      },
      {
        method: "GET",
        path: "/api/talenta/attendance/:employeeId",
        description: "Get employee attendance records",
        params: {
          employeeId: "string (required)",
        },
        query: {
          startDate: "string (optional, YYYY-MM-DD)",
          endDate: "string (optional, YYYY-MM-DD)",
        },
      },
    ],
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.stack)
  res.status(500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong!",
    timestamp: new Date().toISOString(),
  })
})

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "GET /",
      "GET /health",
      "GET /api",
      "POST /api/talenta/clockin",
      "POST /api/talenta/clockout",
      "GET /api/talenta/attendance/:employeeId",
    ],
  })
})

// For local development
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Talenta API server is running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/health`)
    console.log(`API docs: http://localhost:${PORT}/api`)
  })
}

// Export for Vercel
module.exports = app
