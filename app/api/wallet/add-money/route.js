import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount } = await request.json()
    const parsedAmount = parseFloat(amount)

    if (!parsedAmount || parsedAmount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }
    if (parsedAmount > 100000) {
      return NextResponse.json({ error: 'Maximum add amount is ₹1,00,000' }, { status: 400 })
    }

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.userId },
        data: { walletBalance: { increment: parsedAmount } }
      }),
      prisma.transaction.create({
        data: {
          userId: user.userId,
          amount: parsedAmount,
          type: 'credit',
          description: `Wallet top-up of ₹${parsedAmount.toFixed(2)}`,
        }
      })
    ])

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.walletBalance,
      transaction,
    })

  } catch (error) {
    console.error('Wallet add-money error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
