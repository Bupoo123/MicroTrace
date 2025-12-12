import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { approveDocument } from '@/lib/document'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
      include: {
        creator: true,
        approver: true,
        lines: { include: { sample: { include: { location: true } } } },
        returnFromDoc: {
          include: { lines: { include: { sample: true } } },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: '单据不存在' }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Get document error:', error)
    return NextResponse.json(
      { error: '获取单据详情失败' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''

    const doc = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!doc) {
      return NextResponse.json({ error: '单据不存在' }, { status: 404 })
    }

    if (doc.status !== 'DRAFT') {
      return NextResponse.json(
        { error: '只能编辑草稿状态的单据' },
        { status: 400 }
      )
    }

    // 删除旧的行
    await prisma.documentLine.deleteMany({
      where: { documentId: params.id },
    })

    // 更新单据并创建新行
    const document = await prisma.document.update({
      where: { id: params.id },
      data: {
        description: body.description,
        disposeReason: body.disposeReason,
        disposeMethod: body.disposeMethod,
        disposeOperator: body.disposeOperator,
        disposeSupervisor: body.disposeSupervisor,
        disposeApprover: body.disposeApprover,
        returnFromDocId: body.returnFromDocId || null,
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
      'EDIT',
      'Document',
      document.id,
      `编辑单据 ${document.docNo}`
    )

    return NextResponse.json(document)
  } catch (error) {
    console.error('Update document error:', error)
    return NextResponse.json(
      { error: '更新单据失败' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''
    const action = body.action

    const doc = await prisma.document.findUnique({
      where: { id: params.id },
    })

    if (!doc) {
      return NextResponse.json({ error: '单据不存在' }, { status: 404 })
    }

    if (action === 'submit') {
      if (doc.status !== 'DRAFT') {
        return NextResponse.json(
          { error: '只能提交草稿状态的单据' },
          { status: 400 }
        )
      }

      const document = await prisma.document.update({
        where: { id: params.id },
        data: { status: 'SUBMIT' },
      })

      await createAuditLog(
        userId,
        'SUBMIT',
        'Document',
        document.id,
        `提交单据 ${document.docNo}`
      )

      return NextResponse.json(document)
    }

    if (action === 'approve') {
      await approveDocument(params.id, userId)

      const document = await prisma.document.findUnique({
        where: { id: params.id },
      })

      await createAuditLog(
        userId,
        'APPROVE',
        'Document',
        document!.id,
        `审核通过单据 ${document!.docNo}`
      )

      return NextResponse.json(document)
    }

    if (action === 'reject') {
      const document = await prisma.document.update({
        where: { id: params.id },
        data: { status: 'REJECT' },
      })

      await createAuditLog(
        userId,
        'REJECT',
        'Document',
        document.id,
        `拒绝单据 ${document.docNo}`
      )

      return NextResponse.json(document)
    }

    if (action === 'cancel') {
      const document = await prisma.document.update({
        where: { id: params.id },
        data: { status: 'CANCEL' },
      })

      await createAuditLog(
        userId,
        'CANCEL',
        'Document',
        document.id,
        `作废单据 ${document.docNo}`
      )

      return NextResponse.json(document)
    }

    return NextResponse.json({ error: '未知操作' }, { status: 400 })
  } catch (error: any) {
    console.error('Document action error:', error)
    return NextResponse.json(
      { error: error.message || '操作失败' },
      { status: 500 }
    )
  }
}

