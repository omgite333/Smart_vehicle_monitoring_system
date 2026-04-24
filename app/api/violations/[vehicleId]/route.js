import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request, { params }) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicleId } = params

    // Only allow users to view their own violations
    if (vehicleId !== user.vehicleId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const violations = await prisma.violation.findMany({
      where: { vehicleId },
      orderBy: { timestamp: 'desc' },
    })

    const unpaid = violations.filter(v => v.status === 'unpaid')
    const paid = violations.filter(v => v.status === 'paid')
    const totalFine = unpaid.reduce((sum, v) => sum + v.fine, 0)

    return NextResponse.json({ violations, unpaid, paid, totalFine })
  } catch (error) {
    console.error('Violations list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
