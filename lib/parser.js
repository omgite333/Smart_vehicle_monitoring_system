/**
 * Parser for IoT hardware input - supports both JSON and raw message formats
 */

export function parseInput(input) {
  // If it's already an object/JSON
  if (typeof input === 'object' && input !== null) {
    return {
      vehicleId: input.vehicleId || null,
      speed: parseFloat(input.speed) || 0,
      latitude: parseFloat(input.latitude) || 0,
      longitude: parseFloat(input.longitude) || 0,
      fine: parseFloat(input.fine) || null,
      rawMessage: null
    }
  }

  // If it's a string, try JSON first
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input)
      return {
        vehicleId: parsed.vehicleId || null,
        speed: parseFloat(parsed.speed) || 0,
        latitude: parseFloat(parsed.latitude) || 0,
        longitude: parseFloat(parsed.longitude) || 0,
        fine: parseFloat(parsed.fine) || null,
        rawMessage: null
      }
    } catch {
      // Not JSON, parse as raw message
      return parseRawMessage(input)
    }
  }

  return null
}

function parseRawMessage(message) {
  const result = {
    vehicleId: null,
    speed: 0,
    latitude: 0,
    longitude: 0,
    fine: null,
    rawMessage: message
  }

  // Extract vehicleId - "VehicleId: V123" or "Vehicle ID: V123"
  const vehicleIdMatch = message.match(/vehicle\s*id[:\s]+([A-Z0-9]+)/i)
  if (vehicleIdMatch) result.vehicleId = vehicleIdMatch[1].trim()

  // Extract speed - "Speed: 55 km/h"
  const speedMatch = message.match(/speed[:\s]+([\d.]+)\s*km\/h/i)
  if (speedMatch) result.speed = parseFloat(speedMatch[1])

  // Extract fine - "Fine: Rs. 500" or "Fine: 500"
  const fineMatch = message.match(/fine[:\s]+(?:rs\.?\s*)?([\d.]+)/i)
  if (fineMatch) result.fine = parseFloat(fineMatch[1])

  // Extract coordinates from Google Maps URL "?q=16.8542,74.6015"
  const coordMatch = message.match(/[?&]q=([-\d.]+),([-\d.]+)/)
  if (coordMatch) {
    result.latitude = parseFloat(coordMatch[1])
    result.longitude = parseFloat(coordMatch[2])
  }

  // Also try direct lat/long pattern "Lat: 16.8542, Long: 74.6015"
  if (!result.latitude) {
    const latMatch = message.match(/lat(?:itude)?[:\s]+([-\d.]+)/i)
    const lngMatch = message.match(/lon(?:g(?:itude)?)?[:\s]+([-\d.]+)/i)
    if (latMatch) result.latitude = parseFloat(latMatch[1])
    if (lngMatch) result.longitude = parseFloat(lngMatch[1])
  }

  return result
}

export function calculateViolation(speed) {
  const SPEED_LIMIT = 40

  if (speed <= SPEED_LIMIT) {
    return null
  }

  const fine = speed > SPEED_LIMIT + 20 ? 1000 : 500

  return {
    speedLimit: SPEED_LIMIT,
    fine,
    isViolation: true
  }
}

export function generateMapLink(latitude, longitude) {
  return `https://maps.google.com/?q=${latitude},${longitude}`
}
