const axios = require("axios")

class LocationService {
  constructor() {
    this.allowedLocations = process.env.ALLOWED_LOCATIONS ? JSON.parse(process.env.ALLOWED_LOCATIONS) : []
    this.locationRadius = process.env.LOCATION_RADIUS || 100 // meters
  }

  async validateLocation(latitude, longitude) {
    if (this.allowedLocations.length === 0) {
      return true // No location restrictions
    }

    for (const allowedLocation of this.allowedLocations) {
      const distance = this.calculateDistance(latitude, longitude, allowedLocation.latitude, allowedLocation.longitude)

      if (distance <= this.locationRadius) {
        return true
      }
    }

    return false
  }

  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  async getLocationInfo(latitude, longitude) {
    try {
      // You can integrate with a geocoding service here
      return {
        latitude,
        longitude,
        timestamp: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error getting location info:", error)
      return null
    }
  }
}

module.exports = new LocationService()
