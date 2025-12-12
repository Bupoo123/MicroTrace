import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getStock } from '@/lib/document'

export async function GET() {
  try {
    const samples = await prisma.sampleMaster.findMany({
      include: { location: true },
    })

    const stockData = await Promise.all(
      samples.map(async (sample) => {
        const stock = await getStock(sample.id)
        return {
          ...sample,
          stock,
        }
      })
    )

    // 过滤掉库存为0的样本（可选）
    const filteredData = stockData.filter((item) => Number(item.stock) !== 0)

    return NextResponse.json({ data: filteredData })
  } catch (error) {
    console.error('Get stock report error:', error)
    return NextResponse.json(
      { error: '获取库存报表失败' },
      { status: 500 }
    )
  }
}

