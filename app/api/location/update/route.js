import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseInput, calculateViolation, generateMapLink } from '@/lib/parser'

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''
    let input

    if (contentType.includes('application/json')) {
      input = await request.json()
    } else {
      const text = await request.text()
      input = text
    }

    const parsed = parseInput(input)
    if (!parsed) {
      return NextResponse.json({ error: 'Invalid input format' }, { status: 400 })
    }

    const { vehicleId, speed, latitude, longitude, rawMessage } = parsed

    if (!vehicleId || !latitude || !longitude) {
      return NextResponse.json({ error: 'vehicleId, latitude, and longitude are required' }, { status: 400 })
    }

    // Save location
    const location = await prisma.location.create({
      data: { vehicleId, latitude, longitude, speed }
    })

    let violation = null
    const violationCheck = calculateViolation(speed)

    if (violationCheck) {
      const mapLink = generateMapLink(latitude, longitude)
      violation = await prisma.violation.create({
        data: {
          vehicleId,
          speed,
          speedLimit: violationCheck.speedLimit,
          fine: violationCheck.fine,
          latitude,
          longitude,
          mapLink,
          rawMessage: rawMessage || null,
          status: 'unpaid',
        }
      })
    }

    return NextResponse.json({
      success: true,
      location,
      violation: violation || null,
      message: violation
        ? `Violation recorded: ${speed} km/h (limit: ${violationCheck.speedLimit}), Fine: ₹${violationCheck.fine}`
        : 'Location updated successfully'
    })

  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
