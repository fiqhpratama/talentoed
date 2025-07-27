const axios = require("axios")
const moment = require("moment")

class TalentaController {
  constructor() {
    this.baseURL = process.env.TALENTA_BASE_URL || "https://api.talenta.co"
    this.apiKey = process.env.TALENTA_API_KEY

    if (!this.apiKey) {
      console.warn("TALENTA_API_KEY not found in environment variables")
    }
  }

  async clockIn(req, res) {
    try {
      const { employeeId, latitude, longitude, notes } = req.body
      const timestamp = moment().toISOString()

      // Validate required fields
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      // Validate location if required
      if (process.env.VALIDATE_LOCATION === "true") {
        if (!latitude || !longitude) {
          return res.status(400).json({
            success: false,
            message: "Location coordinates are required when location validation is enabled",
          })
        }

        const location = require("../location")
        const isValidLocation = await location.validateLocation(latitude, longitude)
        if (!isValidLocation) {
          return res.status(400).json({
            success: false,
            message: "Invalid location for clock in",
          })
        }
      }

      const clockInData = {
        employee_id: employeeId,
        clock_in_time: timestamp,
        location: latitude && longitude ? { latitude, longitude } : null,
        notes: notes || "",
        device_info: req.headers["user-agent"] || "Unknown",
        ip_address: req.ip || req.connection.remoteAddress,
      }

      // If API key is not configured, return mock response
      if (!this.apiKey) {
        return res.status(200).json({
          success: true,
          message: "Clock in successful (Mock Mode - Configure TALENTA_API_KEY for real API)",
          data: {
            employeeId,
            clockInTime: timestamp,
            location: clockInData.location,
            notes: clockInData.notes,
            mock: true,
          },
        })
      }

      // Make API call to Talenta
      const response = await this.makeAPICall("/attendance/clockin", "POST", clockInData)

      res.status(200).json({
        success: true,
        message: "Clock in successful",
        data: {
          employeeId,
          clockInTime: timestamp,
          ...response.data,
        },
      })
    } catch (error) {
      console.error("Clock in error:", error.message)
      res.status(500).json({
        success: false,
        message: "Clock in failed",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  }

  async clockOut(req, res) {
    try {
      const { employeeId, latitude, longitude, notes } = req.body
      const timestamp = moment().toISOString()

      // Validate required fields
      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      // Validate location if required
      if (process.env.VALIDATE_LOCATION === "true") {
        if (!latitude || !longitude) {
          return res.status(400).json({
            success: false,
            message: "Location coordinates are required when location validation is enabled",
          })
        }

        const location = require("../location")
        const isValidLocation = await location.validateLocation(latitude, longitude)
        if (!isValidLocation) {
          return res.status(400).json({
            success: false,
            message: "Invalid location for clock out",
          })
        }
      }

      const clockOutData = {
        employee_id: employeeId,
        clock_out_time: timestamp,
        location: latitude && longitude ? { latitude, longitude } : null,
        notes: notes || "",
        device_info: req.headers["user-agent"] || "Unknown",
        ip_address: req.ip || req.connection.remoteAddress,
      }

      // If API key is not configured, return mock response
      if (!this.apiKey) {
        return res.status(200).json({
          success: true,
          message: "Clock out successful (Mock Mode - Configure TALENTA_API_KEY for real API)",
          data: {
            employeeId,
            clockOutTime: timestamp,
            location: clockOutData.location,
            notes: clockOutData.notes,
            mock: true,
          },
        })
      }

      // Make API call to Talenta
      const response = await this.makeAPICall("/attendance/clockout", "POST", clockOutData)

      res.status(200).json({
        success: true,
        message: "Clock out successful",
        data: {
          employeeId,
          clockOutTime: timestamp,
          ...response.data,
        },
      })
    } catch (error) {
      console.error("Clock out error:", error.message)
      res.status(500).json({
        success: false,
        message: "Clock out failed",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  }

  async getAttendance(req, res) {
    try {
      const { employeeId } = req.params
      const { startDate, endDate } = req.query

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      const params = {
        employee_id: employeeId,
        start_date: startDate || moment().startOf("month").format("YYYY-MM-DD"),
        end_date: endDate || moment().endOf("month").format("YYYY-MM-DD"),
      }

      // If API key is not configured, return mock response
      if (!this.apiKey) {
        return res.status(200).json({
          success: true,
          message: "Mock attendance data (Configure TALENTA_API_KEY for real API)",
          data: {
            employeeId,
            period: {
              startDate: params.start_date,
              endDate: params.end_date,
            },
            records: [
              {
                date: moment().format("YYYY-MM-DD"),
                clockIn: "09:00:00",
                clockOut: "17:00:00",
                workingHours: 8,
                status: "Present",
              },
            ],
            mock: true,
          },
        })
      }

      const response = await this.makeAPICall("/attendance/records", "GET", null, params)

      res.status(200).json({
        success: true,
        data: response.data,
      })
    } catch (error) {
      console.error("Get attendance error:", error.message)
      res.status(500).json({
        success: false,
        message: "Failed to get attendance records",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  }

  async getAttendanceSummary(req, res) {
    try {
      const { employeeId } = req.params
      const { month, year } = req.query

      if (!employeeId) {
        return res.status(400).json({
          success: false,
          message: "Employee ID is required",
        })
      }

      const params = {
        employee_id: employeeId,
        month: month || moment().month() + 1,
        year: year || moment().year(),
      }

      // If API key is not configured, return mock response
      if (!this.apiKey) {
        return res.status(200).json({
          success: true,
          message: "Mock attendance summary (Configure TALENTA_API_KEY for real API)",
          data: {
            employeeId,
            period: `${params.year}-${params.month.toString().padStart(2, "0")}`,
            summary: {
              totalWorkingDays: 22,
              presentDays: 20,
              absentDays: 2,
              lateDays: 3,
              overtimeHours: 15,
              totalWorkingHours: 160,
            },
            mock: true,
          },
        })
      }

      const response = await this.makeAPICall("/attendance/summary", "GET", null, params)

      res.status(200).json({
        success: true,
        data: response.data,
      })
    } catch (error) {
      console.error("Get attendance summary error:", error.message)
      res.status(500).json({
        success: false,
        message: "Failed to get attendance summary",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  }

  async makeAPICall(endpoint, method = "GET", data = null, params = null) {
    if (!this.apiKey) {
      throw new Error("TALENTA_API_KEY is not configured")
    }

    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "Talenta-API-Client/1.0.0",
      },
      timeout: 30000, // 30 seconds timeout for Vercel
    }

    if (data) {
      config.data = data
    }

    if (params) {
      config.params = params
    }

    return await axios(config)
  }
}

module.exports = new TalentaController()
