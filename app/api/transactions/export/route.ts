import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sampleCode = searchParams.get('sampleCode')
    const type = searchParams.get('type')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const docNo = searchParams.get('docNo')

    const where: any = {}
    if (sampleCode) {
      where.sample = { sampleCode: { contains: sampleCode } }
    }
    if (type) {
      where.type = type
    }
    if (docNo) {
      where.document = { docNo: { contains: docNo } }
    }
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate + 'T23:59:59')
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        sample: true,
        document: { include: { creator: { select: { name: true } } } },
        operator: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('流水明细')

    worksheet.columns = [
      { header: '时间', key: 'createdAt', width: 20 },
      { header: '单据号', key: 'docNo', width: 20 },
      { header: '样本编码', key: 'sampleCode', width: 15 },
      { header: '样本名称', key: 'sampleName', width: 20 },
      { header: '类型', key: 'type', width: 10 },
      { header: '数量变化', key: 'quantityDelta', width: 12 },
      { header: '批号', key: 'batchNo', width: 15 },
      { header: '操作人', key: 'operator', width: 15 },
      { header: '备注', key: 'remark', width: 30 },
    ]

    transactions.forEach((t) => {
      worksheet.addRow({
        createdAt: t.createdAt.toLocaleString('zh-CN'),
        docNo: t.document.docNo,
        sampleCode: t.sample.sampleCode,
        sampleName: t.sample.name,
        type: t.type === 'IN' ? '入库' : t.type === 'OUT' ? '出库' : t.type === 'RETURN' ? '返库' : '销毁',
        quantityDelta: Number(t.quantityDelta),
        batchNo: t.batchNo || '',
        operator: t.operator?.name || '',
        remark: t.remark || '',
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="流水明细_${new Date().toISOString().split('T')[0]}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Export transactions error:', error)
    return NextResponse.json(
      { error: '导出失败' },
      { status: 500 }
    )
  }
}

