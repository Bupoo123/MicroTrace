// 公共类型定义

// 交易类型常量
export const TransactionTypes = {
  IN: 'IN',
  OUT: 'OUT',
  RETURN: 'RETURN',
  DISPOSE: 'DISPOSE',
} as const

// 交易类型
export type TransactionType =
  typeof TransactionTypes[keyof typeof TransactionTypes]

// 单据类型常量
export const DocumentTypes = {
  IN: 'IN',
  OUT: 'OUT',
  RETURN: 'RETURN',
  DISPOSE: 'DISPOSE',
} as const

// 单据类型
export type DocumentType =
  typeof DocumentTypes[keyof typeof DocumentTypes]

// 单据状态常量
export const DocumentStatuses = {
  DRAFT: 'DRAFT',
  SUBMIT: 'SUBMIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  CANCEL: 'CANCEL',
} as const

// 单据状态
export type DocumentStatus =
  typeof DocumentStatuses[keyof typeof DocumentStatuses]

