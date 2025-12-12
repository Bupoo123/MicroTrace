import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sample = await prisma.sampleMaster.findUnique({
      where: { id: params.id },
      include: { location: true },
    })

    if (!sample) {
      return NextResponse.json({ error: '样本不存在' }, { status: 404 })
    }

    return NextResponse.json(sample)
  } catch (error) {
    console.error('Get sample error:', error)
    return NextResponse.json(
      { error: '获取样本详情失败' },
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

    const sample = await prisma.sampleMaster.update({
      where: { id: params.id },
      data: {
        name: body.name,
        type: body.type,
        spec: body.spec,
        unit: body.unit,
        source: body.source,
        storageCondition: body.storageCondition,
        expiryMonths: body.expiryMonths,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
        locationId: body.locationId,
        patientAge: body.patientAge,
        patientSex: body.patientSex,
        diagnosis: body.diagnosis,
        detectedPathogen: body.detectedPathogen,
        samplingDate: body.samplingDate ? new Date(body.samplingDate) : null,
        volumeMl: body.volumeMl,
      },
    })

    await createAuditLog(
      userId,
      'EDIT',
      'SampleMaster',
      sample.id,
      `编辑样本 ${sample.sampleCode}`
    )

    return NextResponse.json(sample)
  } catch (error) {
    console.error('Update sample error:', error)
    return NextResponse.json(
      { error: '更新样本失败' },
      { status: 500 }
    )
  }
}

