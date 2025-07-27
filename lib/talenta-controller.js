const axios = require("axios")
const moment = require("moment")
const location = require("../location")

class TalentaController {
  constructor() {
    this.baseURL = process.env.TALENTA_BASE_URL || "https://api.talenta.co"
    this.apiKey = process.env.TALENTA_API_KEY
  }

  async clockIn(req, res) {
    try {
      const { employeeId, latitude, longitude, notes } = req.body
      const timestamp = moment().toISOString()

      // Validate location if required
      if (process.env.VALIDATE_LOCATION === "true") {
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
        location: {
          latitude,
          longitude,
        },
        notes: notes || "",
        device_info: req.headers["user-agent"],
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
      console.error("Clock in error:", error)
      res.status(500).json({
        success: false,
        message: "Clock in failed",
        error: error.message,
      })
    }
  }

  async clockOut(req, res) {
    try {
      const { employeeId, latitude, longitude, notes } = req.body
      const timestamp = moment().toISOString()

      // Validate location if required
      if (process.env.VALIDATE_LOCATION === "true") {
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
        location: {
          latitude,
          longitude,
        },
        notes: notes || "",
        device_info: req.headers["user-agent"],
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
      console.error("Clock out error:", error)
      res.status(500).json({
        success: false,
        message: "Clock out failed",
        error: error.message,
      })
    }
  }

  async getAttendance(req, res) {
    try {
      const { employeeId } = req.params
      const { startDate, endDate } = req.query

      const params = {
        employee_id: employeeId,
        start_date: startDate || moment().startOf("month").format("YYYY-MM-DD"),
        end_date: endDate || moment().endOf("month").format("YYYY-MM-DD"),
      }

      const response = await this.makeAPICall("/attendance/records", "GET", null, params)

      res.status(200).json({
        success: true,
        data: response.data,
      })
    } catch (error) {
      console.error("Get attendance error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get attendance records",
        error: error.message,
      })
    }
  }

  async getAttendanceSummary(req, res) {
    try {
      const { employeeId } = req.params
      const { month, year } = req.query

      const params = {
        employee_id: employeeId,
        month: month || moment().month() + 1,
        year: year || moment().year(),
      }

      const response = await this.makeAPICall("/attendance/summary", "GET", null, params)

      res.status(200).json({
        success: true,
        data: response.data,
      })
    } catch (error) {
      console.error("Get attendance summary error:", error)
      res.status(500).json({
        success: false,
        message: "Failed to get attendance summary",
        error: error.message,
      })
    }
  }

  async bulkClockIn(req, res) {
    try {
      const { employees } = req.body
      const results = []

      for (const employee of employees) {
        try {
          const clockInData = {
            employee_id: employee.employeeId,
            clock_in_time: moment().toISOString(),
            location: employee.location,
            notes: employee.notes || "",
          }

          const response = await this.makeAPICall("/attendance/clockin", "POST", clockInData)
          results.push({
            employeeId: employee.employeeId,
            success: true,
            data: response.data,
          })
        } catch (error) {
          results.push({
            employeeId: employee.employeeId,
            success: false,
            error: error.message,
          })
        }
      }

      res.status(200).json({
        success: true,
        message: "Bulk clock in completed",
        results,
      })
    } catch (error) {
      console.error("Bulk clock in error:", error)
      res.status(500).json({
        success: false,
        message: "Bulk clock in failed",
        error: error.message,
      })
    }
  }

  async bulkClockOut(req, res) {
    try {
      const { employees } = req.body
      const results = []

      for (const employee of employees) {
        try {
          const clockOutData = {
            employee_id: employee.employeeId,
            clock_out_time: moment().toISOString(),
            location: employee.location,
            notes: employee.notes || "",
          }

          const response = await this.makeAPICall("/attendance/clockout", "POST", clockOutData)
          results.push({
            employeeId: employee.employeeId,
            success: true,
            data: response.data,
          })
        } catch (error) {
          results.push({
            employeeId: employee.employeeId,
            success: false,
            error: error.message,
          })
        }
      }

      res.status(200).json({
        success: true,
        message: "Bulk clock out completed",
        results,
      })
    } catch (error) {
      console.error("Bulk clock out error:", error)
      res.status(500).json({
        success: false,
        message: "Bulk clock out failed",
        error: error.message,
      })
    }
  }

  async makeAPICall(endpoint, method = "GET", data = null, params = null) {
    const config = {
      method,
      url: `${this.baseURL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
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
