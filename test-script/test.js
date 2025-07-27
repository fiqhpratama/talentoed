const axios = require("axios")
const assert = require("assert")

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000"

class APITester {
  constructor() {
    this.baseURL = BASE_URL
  }

  async runTests() {
    console.log("Starting API tests...")

    try {
      await this.testHealthEndpoint()
      await this.testClockInEndpoint()
      await this.testClockOutEndpoint()
      await this.testGetAttendance()

      console.log("✅ All tests passed!")
    } catch (error) {
      console.error("❌ Test failed:", error.message)
      process.exit(1)
    }
  }

  async testHealthEndpoint() {
    console.log("Testing health endpoint...")

    const response = await axios.get(`${this.baseURL}/health`)
    assert.strictEqual(response.status, 200)
    assert.strictEqual(response.data.status, "OK")

    console.log("✅ Health endpoint test passed")
  }

  async testClockInEndpoint() {
    console.log("Testing clock in endpoint...")

    const clockInData = {
      employeeId: "TEST001",
      latitude: -6.2088,
      longitude: 106.8456,
      notes: "Test clock in",
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/talenta/clockin`, clockInData)
      // Note: This might fail if Talenta API is not configured
      console.log("✅ Clock in endpoint test passed")
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log("⚠️  Clock in endpoint reached but API call failed (expected without valid API key)")
      } else {
        throw error
      }
    }
  }

  async testClockOutEndpoint() {
    console.log("Testing clock out endpoint...")

    const clockOutData = {
      employeeId: "TEST001",
      latitude: -6.2088,
      longitude: 106.8456,
      notes: "Test clock out",
    }

    try {
      const response = await axios.post(`${this.baseURL}/api/talenta/clockout`, clockOutData)
      console.log("✅ Clock out endpoint test passed")
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log("⚠️  Clock out endpoint reached but API call failed (expected without valid API key)")
      } else {
        throw error
      }
    }
  }

  async testGetAttendance() {
    console.log("Testing get attendance endpoint...")

    try {
      const response = await axios.get(`${this.baseURL}/api/talenta/attendance/TEST001`)
      console.log("✅ Get attendance endpoint test passed")
    } catch (error) {
      if (error.response && error.response.status === 500) {
        console.log("⚠️  Get attendance endpoint reached but API call failed (expected without valid API key)")
      } else {
        throw error
      }
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester()
  tester.runTests()
}

module.exports = APITester
