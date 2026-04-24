import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [dbUser, latestLocation, latestViolation, unpaidViolations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.userId },
        select: { walletBalance: true, name: true, vehicleId: true }
      }),
      prisma.location.findFirst({
        where: { vehicleId: user.vehicleId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.violation.findFirst({
        where: { vehicleId: user.vehicleId },
        orderBy: { timestamp: 'desc' },
      }),
      prisma.violation.findMany({
        where: { vehicleId: user.vehicleId, status: 'unpaid' },
        select: { fine: true }
      }),
    ])

    const totalUnpaidFine = unpaidViolations.reduce((sum, v) => sum + v.fine, 0)

    return NextResponse.json({
      walletBalance: dbUser?.walletBalance ?? 0,
      latestLocation,
      latestViolation,
      unpaidCount: unpaidViolations.length,
      totalUnpaidFine,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
