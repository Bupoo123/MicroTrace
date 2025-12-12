import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = {}
    if (search) {
      where.OR = [
        { sampleCode: { contains: search } },
        { name: { contains: search } },
      ]
    }

    const [samples, total] = await Promise.all([
      prisma.sampleMaster.findMany({
        where,
        include: { location: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sampleMaster.count({ where }),
    ])

    return NextResponse.json({
      data: samples,
      total,
      page,
      pageSize,
    })
  } catch (error) {
    console.error('Get samples error:', error)
    return NextResponse.json(
      { error: '获取样本列表失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const userId = request.headers.get('x-user-id') || ''

    const sample = await prisma.sampleMaster.create({
      data: {
        sampleCode: body.sampleCode,
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
      'CREATE',
      'SampleMaster',
      sample.id,
      `创建样本 ${sample.sampleCode}`
    )

    return NextResponse.json(sample)
  } catch (error: any) {
    console.error('Create sample error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: '样本编码已存在' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: '创建样本失败' },
      { status: 500 }
    )
  }
}

