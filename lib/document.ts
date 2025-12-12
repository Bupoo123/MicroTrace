import { prisma } from './prisma'

export type DocumentType = 'IN' | 'OUT' | 'RETURN' | 'DISPOSE'
export type DocumentStatus = 'DRAFT' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL'
export type TransactionType = 'IN' | 'OUT' | 'RETURN' | 'DISPOSE'

// 生成单据号
export async function generateDocNo(type: DocumentType): Promise<string> {
  const prefix = {
    IN: 'IN',
    OUT: 'OUT',
    RETURN: 'RET',
    DISPOSE: 'DIS',
  }[type]

  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const count = await prisma.document.count({
    where: {
      type: type as any,
      docNo: {
        startsWith: `${prefix}-${today}`,
      },
    },
  })

  const seq = String(count + 1).padStart(4, '0')
  return `${prefix}-${today}-${seq}`
}

// 审核单据
export async function approveDocument(
  docId: string,
  approverId: string
): Promise<void> {
  const doc = await prisma.document.findUnique({
    where: { id: docId },
    include: { lines: { include: { sample: true } } },
  })

  if (!doc) throw new Error('单据不存在')
  if (doc.status !== 'SUBMIT') {
    throw new Error('只能审核已提交的单据')
  }

  // 出库和销毁需要检查库存
  if (doc.type === 'OUT' || doc.type === 'DISPOSE') {
    for (const line of doc.lines) {
      const stock = await getStock(line.sampleId)
      if (Number(stock) < Number(line.quantity)) {
        throw new Error(
          `样本 ${line.sample.sampleCode} 库存不足，当前库存：${stock}`
        )
      }
    }
  }

  // 返库需要检查可返数量
  if (doc.type === 'RETURN') {
    if (!doc.returnFromDocId) {
      throw new Error('返库单必须关联原出库单')
    }

    const returnFromDoc = await prisma.document.findUnique({
      where: { id: doc.returnFromDocId },
      include: { lines: true },
    })

    if (!returnFromDoc) throw new Error('原出库单不存在')

    for (const line of doc.lines) {
      const originalLine = returnFromDoc.lines.find(
        (l) => l.sampleId === line.sampleId
      )
      if (!originalLine) {
        throw new Error(`样本 ${line.sample.sampleCode} 不在原出库单中`)
      }

      // 计算已返数量
      const returnedQty = await prisma.transaction
        .aggregate({
          where: {
            document: {
              type: 'RETURN',
              returnFromDocId: doc.returnFromDocId,
              status: 'APPROVE',
            },
            sampleId: line.sampleId,
            type: 'RETURN',
          },
          _sum: {
            quantityDelta: true,
          },
        })
        .then((r) => Number(r._sum.quantityDelta || 0))

      const availableReturn = Number(originalLine.quantity) - returnedQty
      if (Number(line.quantity) > availableReturn) {
        throw new Error(
          `样本 ${line.sample.sampleCode} 可返数量不足，可返：${availableReturn}`
        )
      }
    }
  }

  // 更新单据状态
  await prisma.document.update({
    where: { id: docId },
    data: {
      status: 'APPROVE',
      approverId,
      approvedAt: new Date(),
    },
  })

  // 生成库存流水
  const transactionType: TransactionType = {
    IN: 'IN',
    OUT: 'OUT',
    RETURN: 'RETURN',
    DISPOSE: 'DISPOSE',
  }[doc.type as DocumentType]

  for (const line of doc.lines) {
    const quantityDelta =
      doc.type === 'OUT' || doc.type === 'DISPOSE'
        ? -Number(line.quantity)
        : Number(line.quantity)

    await prisma.transaction.create({
      data: {
        documentId: docId,
        sampleId: line.sampleId,
        type: transactionType as any,
        quantityDelta,
        batchNo: line.batchNo,
        remark: line.remark,
        operatorId: approverId,
      },
    })
  }
}

// 获取库存
export async function getStock(sampleId: string): Promise<number> {
  const result = await prisma.transaction.aggregate({
    where: { sampleId },
    _sum: {
      quantityDelta: true,
    },
  })

  return Number(result._sum.quantityDelta || 0)
}

