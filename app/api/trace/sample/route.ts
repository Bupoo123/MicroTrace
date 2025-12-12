import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sampleCode = searchParams.get('sampleCode')

    if (!sampleCode) {
      return NextResponse.json(
        { error: '样本编码不能为空' },
        { status: 400 }
      )
    }

    const sample = await prisma.sampleMaster.findUnique({
      where: { sampleCode },
      include: { location: true },
    })

    if (!sample) {
      return NextResponse.json({ error: '样本不存在' }, { status: 404 })
    }

    // 获取所有相关流水
    const transactions = await prisma.transaction.findMany({
      where: { sampleId: sample.id },
      include: {
        document: {
          include: {
            creator: { select: { name: true } },
            approver: { select: { name: true } },
          },
        },
        operator: { select: { name: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    // 计算当前库存
    const stock = transactions.reduce(
      (sum, t) => sum + Number(t.quantityDelta),
      0
    )

    return NextResponse.json({
      sample,
      transactions,
      stock,
    })
  } catch (error) {
    console.error('Trace sample error:', error)
    return NextResponse.json(
      { error: '溯源查询失败' },
      { status: 500 }
    )
  }
}

