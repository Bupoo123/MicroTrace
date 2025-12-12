import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('开始初始化数据库...')

  // 创建默认用户
  const password = await bcrypt.hash('123456', 10)
  
  const users = [
    {
      username: 'admin',
      password,
      name: '系统管理员',
      role: 'ADMIN',
    },
    {
      username: 'input',
      password,
      name: '录入员',
      role: 'INPUT',
    },
    {
      username: 'audit',
      password,
      name: '审核员',
      role: 'AUDIT',
    },
    {
      username: 'query',
      password,
      name: '查询员',
      role: 'QUERY',
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: {},
      create: user,
    })
  }

  // 创建默认位置
  const locations = [
    { code: 'LOC-001', name: '冷库A区', description: '主要存储区域' },
    { code: 'LOC-002', name: '冷库B区', description: '备用存储区域' },
    { code: 'LOC-003', name: '常温库', description: '常温存储区域' },
  ]

  for (const loc of locations) {
    await prisma.location.upsert({
      where: { code: loc.code },
      update: {},
      create: loc,
    })
  }

  console.log('数据库初始化完成！')
  console.log('默认账号：')
  console.log('  管理员: admin / 123456')
  console.log('  录入员: input / 123456')
  console.log('  审核员: audit / 123456')
  console.log('  查询员: query / 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

