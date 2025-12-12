import { NextResponse } from 'next/server'
import { getStock } from '@/lib/document'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const stock = await getStock(params.id)
    return NextResponse.json({ stock })
  } catch (error) {
    console.error('Get stock error:', error)
    return NextResponse.json(
      { error: '获取库存失败' },
      { status: 500 }
    )
  }
}

