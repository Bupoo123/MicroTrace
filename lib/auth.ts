import { prisma } from './prisma'
import * as bcrypt from 'bcryptjs'

export type UserRole = 'INPUT' | 'AUDIT' | 'QUERY' | 'ADMIN'

export interface SessionUser {
  id: string
  username: string
  name: string
  role: UserRole
}

export async function verifyPassword(
  username: string,
  password: string
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) return null

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return null

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role as UserRole,
  }
}

export function canViewSensitiveFields(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'AUDIT'
}

export function canCreateDocument(role: UserRole): boolean {
  return role === 'INPUT' || role === 'ADMIN'
}

export function canApproveDocument(role: UserRole): boolean {
  return role === 'AUDIT' || role === 'ADMIN'
}

export function canViewAuditLog(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'AUDIT'
}

