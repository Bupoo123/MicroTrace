import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''

    const location = await prisma.location.update({
      where: { id: params.id },
      data: {
        name: body.name,
        parentId: body.parentId || null,
        description: body.description,
      },
    })

    await createAuditLog(
      userId,
      'EDIT',
      'Location',
      location.id,
      `编辑位置 ${location.code}`
    )

    return NextResponse.json(location)
  } catch (error) {
    console.error('Update location error:', error)
    return NextResponse.json(
      { error: '更新位置失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.location.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete location error:', error)
    return NextResponse.json(
      { error: '删除位置失败' },
      { status: 500 }
    )
  }
}

