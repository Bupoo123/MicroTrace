import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const docNo = searchParams.get('docNo')

    if (!docNo) {
      return NextResponse.json(
        { error: '单据号不能为空' },
        { status: 400 }
      )
    }

    const document = await prisma.document.findUnique({
      where: { docNo },
      include: {
        creator: true,
        approver: true,
        lines: {
          include: {
            sample: { include: { location: true } },
          },
        },
        returnFromDoc: {
          include: {
            lines: { include: { sample: true } },
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: '单据不存在' }, { status: 404 })
    }

    // 获取单据相关的所有流水
    const transactions = await prisma.transaction.findMany({
      where: { documentId: document.id },
      include: {
        sample: true,
        operator: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({
      document,
      transactions,
    })
  } catch (error) {
    console.error('Trace document error:', error)
    return NextResponse.json(
      { error: '溯源查询失败' },
      { status: 500 }
    )
  }
}

