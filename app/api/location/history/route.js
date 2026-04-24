import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    const locations = await prisma.location.findMany({
      where: { vehicleId: user.vehicleId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    })

    return NextResponse.json({ locations })
  } catch (error) {
    console.error('Location history error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
