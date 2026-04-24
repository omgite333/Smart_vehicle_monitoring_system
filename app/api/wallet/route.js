import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { walletBalance: true, name: true, vehicleId: true }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.userId },
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      walletBalance: dbUser.walletBalance,
      transactions,
    })
  } catch (error) {
    console.error('Wallet GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
