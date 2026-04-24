import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const location = await prisma.location.findFirst({
      where: { vehicleId: user.vehicleId },
      orderBy: { timestamp: 'desc' },
    })

    return NextResponse.json({ location })
  } catch (error) {
    console.error('Location latest error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
