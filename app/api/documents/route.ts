import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateDocNo } from '@/lib/document'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          creator: { select: { name: true } },
          approver: { select: { name: true } },
          lines: { include: { sample: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      data: documents,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: '获取单据列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''

    const docNo = await generateDocNo(body.type)

    const document = await prisma.document.create({
      data: {
        docNo,
        type: body.type,
        status: 'DRAFT',
        description: body.description,
        disposeReason: body.disposeReason,
        disposeMethod: body.disposeMethod,
        disposeOperator: body.disposeOperator,
        disposeSupervisor: body.disposeSupervisor,
        disposeApprover: body.disposeApprover,
        returnFromDocId: body.returnFromDocId || null,
        creatorId: userId,
        lines: {
          create: body.lines.map((line: any) => ({
            sampleId: line.sampleId,
            quantity: line.quantity,
            batchNo: line.batchNo,
            remark: line.remark,
          })),
        },
      },
      include: {
        lines: { include: { sample: true } },
      },
    })

    await createAuditLog(
      userId,
      'CREATE',
      'Document',
      document.id,
      `创建单据 ${docNo}`
    )

    return NextResponse.json(document)
  } catch (error) {
    console.error('Create document error:', error)
    return NextResponse.json(
      { error: '创建单据失败' },
      { status: 500 }
    )
  }
}

