const express = require("express")
const router = express.Router()
const talentaController = require("./talenta-controller")
const { validateClockIn, validateClockOut } = require("./middleware")

// Clock In endpoint
router.post("/clockin", validateClockIn, talentaController.clockIn)

// Clock Out endpoint
router.post("/clockout", validateClockOut, talentaController.clockOut)

// Get attendance records
router.get("/attendance/:employeeId", talentaController.getAttendance)

// Get attendance summary
router.get("/attendance/:employeeId/summary", talentaController.getAttendanceSummary)

// Bulk clock operations
router.post("/bulk/clockin", talentaController.bulkClockIn)
router.post("/bulk/clockout", talentaController.bulkClockOut)

module.exports = router
