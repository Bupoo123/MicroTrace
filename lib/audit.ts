import { prisma } from './prisma'

export type AuditAction = 'CREATE' | 'EDIT' | 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'IMPORT' | 'EXPORT'

export async function createAuditLog(
  userId: string,
  action: AuditAction,
  entityType?: string,
  entityId?: string,
  description?: string,
  metadata?: any
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entityType,
      entityId,
      description,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

