import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, password, vehicleId, vehicleNumber, vehicleModel } = body

    if (!name || !email || !password || !vehicleId) {
      return NextResponse.json({ error: 'Name, email, password, and vehicleId are required' }, { status: 400 })
    }

    // Check existing user
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    const existingVehicleId = await prisma.user.findUnique({ where: { vehicleId } })
    if (existingVehicleId) {
      return NextResponse.json({ error: 'Vehicle ID already registered' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        vehicleId,
        walletBalance: 0,
        vehicles: vehicleNumber && vehicleModel ? {
          create: {
            vehicleId,
            vehicleNumber: vehicleNumber || vehicleId,
            model: vehicleModel || 'Unknown',
          }
        } : undefined
      },
      include: { vehicles: true }
    })

    const token = generateToken({ userId: user.id, email: user.email, vehicleId: user.vehicleId })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        vehicleId: user.vehicleId,
        walletBalance: user.walletBalance,
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
