import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vehicles = await prisma.vehicle.findMany({
      where: { ownerId: user.userId },
      include: { owner: { select: { id: true, name: true, email: true, vehicleId: true } } }
    })

    return NextResponse.json({ vehicles })
  } catch (error) {
    console.error('Vehicle GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = authenticateRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { vehicleNumber, model, vehicleId } = await request.json()
    if (!vehicleNumber || !model) {
      return NextResponse.json({ error: 'vehicleNumber and model are required' }, { status: 400 })
    }

    const vid = vehicleId || user.vehicleId

    const existing = await prisma.vehicle.findUnique({ where: { vehicleId: vid } })
    if (existing) {
      return NextResponse.json({ error: 'Vehicle ID already exists' }, { status: 409 })
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleId: vid,
        vehicleNumber,
        model,
        ownerId: user.userId,
      }
    })

    return NextResponse.json({ success: true, vehicle }, { status: 201 })
  } catch (error) {
    console.error('Vehicle POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
