import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import ExcelJS from 'exceljs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const importType = formData.get('type') as string
    const userId = request.headers.get('x-user-id') || ''

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.load(buffer)

    const worksheet = workbook.worksheets[0]
    const rows = worksheet.getRows(2, worksheet.rowCount - 1) || []

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    if (importType === 'samples') {
      // 导入样本台账
      for (const row of rows) {
        try {
          const sampleCode = row.getCell(1)?.value?.toString()?.trim()
          if (!sampleCode) continue

          const name = row.getCell(2)?.value?.toString()?.trim() || ''
          const locationCode = row.getCell(3)?.value?.toString()?.trim()
          const type = row.getCell(4)?.value?.toString()?.trim()
          const storageCondition = row.getCell(5)?.value?.toString()?.trim()
          const unit = row.getCell(6)?.value?.toString()?.trim()
          const source = row.getCell(7)?.value?.toString()?.trim()
          const inDate = row.getCell(8)?.value
          const inQty = row.getCell(9)?.value
          const stock = row.getCell(10)?.value

          let locationId = null
          if (locationCode) {
            const location = await prisma.location.findUnique({
              where: { code: locationCode },
            })
            if (location) {
              locationId = location.id
            }
          }

          await prisma.sampleMaster.upsert({
            where: { sampleCode },
            update: {
              name,
              type,
              storageCondition,
              unit,
              source,
              locationId,
            },
            create: {
              sampleCode,
              name,
              type,
              storageCondition,
              unit,
              source,
              locationId,
            },
          })

          successCount++
        } catch (error: any) {
          errorCount++
          errors.push(`行 ${row.number}: ${error.message}`)
        }
      }
    } else if (importType === 'inbound') {
      // 导入入库登记
      const docNo = `IN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-0001`
      const lines: any[] = []

      for (const row of rows) {
        try {
          const sampleCode = row.getCell(1)?.value?.toString()?.trim()
          if (!sampleCode) continue

          const name = row.getCell(2)?.value?.toString()?.trim() || ''
          const batchNo = row.getCell(3)?.value?.toString()?.trim()
          const quantity = parseFloat(row.getCell(4)?.value?.toString() || '0')
          const source = row.getCell(5)?.value?.toString()?.trim()
          const inDate = row.getCell(6)?.value

          // 确保样本存在
          let sample = await prisma.sampleMaster.findUnique({
            where: { sampleCode },
          })

          if (!sample) {
            sample = await prisma.sampleMaster.create({
              data: {
                sampleCode,
                name,
                source,
              },
            })
          }

          lines.push({
            sampleId: sample.id,
            quantity,
            batchNo,
          })

          successCount++
        } catch (error: any) {
          errorCount++
          errors.push(`行 ${row.number}: ${error.message}`)
        }
      }

      if (lines.length > 0) {
        await prisma.document.create({
          data: {
            docNo,
            type: 'IN',
            status: 'DRAFT',
            creatorId: userId,
            lines: {
              create: lines,
            },
          },
        })
      }
    }

    await createAuditLog(
      userId,
      'IMPORT',
      'Import',
      undefined,
      `导入${importType === 'samples' ? '样本台账' : '入库登记'}，成功${successCount}条，失败${errorCount}条`
    )

    return NextResponse.json({
      success: true,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // 只返回前10个错误
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: '导入失败' },
      { status: 500 }
    )
  }
}

