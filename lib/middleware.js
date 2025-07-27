const validateClockIn = (req, res, next) => {
  const { employeeId, latitude, longitude } = req.body

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    })
  }

  if (process.env.VALIDATE_LOCATION === "true") {
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      })
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates",
      })
    }
  }

  next()
}

const validateClockOut = (req, res, next) => {
  const { employeeId, latitude, longitude } = req.body

  if (!employeeId) {
    return res.status(400).json({
      success: false,
      message: "Employee ID is required",
    })
  }

  if (process.env.VALIDATE_LOCATION === "true") {
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Location coordinates are required",
      })
    }

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        message: "Invalid location coordinates",
      })
    }
  }

  next()
}

module.exports = {
  validateClockIn,
  validateClockOut,
}
