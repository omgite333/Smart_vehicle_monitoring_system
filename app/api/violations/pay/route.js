import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { violationId } = await request.json()
    if (!violationId) {
      return NextResponse.json({ error: 'violationId is required' }, { status: 400 })
    }

    const violation = await prisma.violation.findUnique({ where: { id: violationId } })
    if (!violation) {
      return NextResponse.json({ error: 'Violation not found' }, { status: 404 })
    }
    if (violation.vehicleId !== user.vehicleId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (violation.status === 'paid') {
      return NextResponse.json({ error: 'Violation already paid' }, { status: 400 })
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (dbUser.walletBalance < violation.fine) {
      return NextResponse.json({
        error: 'Insufficient wallet balance',
        required: violation.fine,
        available: dbUser.walletBalance
      }, { status: 400 })
    }

    // Transactional update
    const [updatedUser, updatedViolation, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.userId },
        data: { walletBalance: { decrement: violation.fine } }
      }),
      prisma.violation.update({
        where: { id: violationId },
        data: { status: 'paid' }
      }),
      prisma.transaction.create({
        data: {
          userId: user.userId,
          amount: violation.fine,
          type: 'debit',
          description: `Fine paid for speeding at ${violation.speed} km/h on ${new Date(violation.timestamp).toLocaleDateString()}`,
        }
      })
    ])

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.walletBalance,
      violation: updatedViolation,
      transaction,
    })

  } catch (error) {
    console.error('Violation pay error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
