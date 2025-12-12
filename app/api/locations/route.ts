import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET() {
  try {
    const locations = await prisma.location.findMany({
      orderBy: { code: 'asc' },
    })
    return NextResponse.json({ data: locations })
  } catch (error) {
    console.error('Get locations error:', error)
    return NextResponse.json(
      { error: '获取位置列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''

    const location = await prisma.location.create({
      data: {
        code: body.code,
        name: body.name,
        parentId: body.parentId || null,
        description: body.description,
      },
    })

    await createAuditLog(
      userId,
      'CREATE',
      'Location',
      location.id,
      `创建位置 ${location.code}`
    )

    return NextResponse.json(location)
  } catch (error: any) {
    console.error('Create location error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '位置编码已存在' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '创建位置失败' },
      { status: 500 }
    )
  }
}

