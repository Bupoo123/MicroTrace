import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalSamples, totalDocuments, pendingApprovals, totalLocations] =
      await Promise.all([
        prisma.sampleMaster.count(),
        prisma.document.count(),
        prisma.document.count({
          where: { status: 'SUBMIT' },
        }),
        prisma.location.count(),
      ])

    return NextResponse.json({
      totalSamples,
      totalDocuments,
      pendingApprovals,
      totalLocations,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    )
  }
}

