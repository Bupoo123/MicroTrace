# 微生物溯源管理器（模拟版）

一个用于管理微生物样本/临床样本的入库、出库、返库、销毁的Web应用系统，支持库存实时核算、溯源查询、报表导出、权限与操作日志。

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: SQLite + Prisma ORM
- **UI组件**: 自定义组件（基于Tailwind CSS）

## 功能特性

### 1. 登录与角色管理
- 支持4种角色：录入岗、审核岗、查询岗、管理员
- 内置测试账号（无需真实企业SSO）

### 2. 样本管理
- 样本主数据管理（编码、名称、类型、规格、单位、来源等）
- 临床敏感字段（患者年龄、性别、诊断、检测病原体等）
- 权限控制：非授权角色隐藏敏感字段

### 3. 位置管理
- 存储位置的创建、编辑、删除
- 支持树形或扁平列表结构

### 4. 单据管理
- **入库(IN)**: 草稿 -> 提交 -> 审核，审核后生成库存流水
- **出库(OUT)**: 审核时校验库存，不足则阻止
- **返库(RETURN)**: 必须关联原出库单，数量不能超过可返数量
- **销毁(DISPOSE)**: 记录销毁原因、处理方式、操作人、监督人、批准人

### 5. 库存核算
- 按样本编码汇总库存 = Σ(quantity_delta)
- 支持小数数量（decimal）

### 6. 流水查询
- 多条件组合查询（样本编码、日期、类型、操作人、单据号）
- 支持导出Excel（xlsx格式）

### 7. 溯源查询
- **样本溯源**: 输入样本编码，显示完整生命周期轨迹
- **单据溯源**: 输入单据号，显示单据下所有样本行及其库存流水

### 8. 操作日志
- 记录关键动作（创建/编辑/提交/审核/作废/导入/导出）
- 支持按时间/用户/动作筛选查看
- 管理员和审核岗可访问

### 9. Excel导入
- 支持导入入库登记模板
- 支持导入样本台账模板
- 自动创建或更新样本数据

### 10. 报表
- 库存台账（按样本汇总）
- 出入库流水明细
- 溯源报告（HTML打印）

## 快速开始

> 📖 **详细部署文档**: 如果您是第一次使用或不熟悉技术，请先查看 [DEPLOYMENT.md](./DEPLOYMENT.md) 获取详细的本地部署步骤说明。

### 安装依赖

```bash
cd /Users/bupoo/Github/MicroTrace
npm install
# 或使用 pnpm: pnpm install
# 或使用 yarn: yarn install
```

### 初始化数据库

```bash
# 生成Prisma客户端
npx prisma generate

# 创建数据库并运行迁移
npx prisma db push

# 初始化种子数据（创建默认用户和位置）
npm run db:seed
# 或: npx tsx prisma/seed.ts
```

### 启动开发服务器

```bash
npm run dev
# 或: pnpm dev
# 或: yarn dev
```

应用将在 http://localhost:5005 启动

### 一键运行

```bash
npm install && npm run dev
# 或: pnpm install && pnpm dev
```

## 默认账号

系统初始化后会创建以下测试账号（密码均为 `123456`）：

- **管理员**: `admin` / `123456`
- **录入员**: `input` / `123456`
- **审核员**: `audit` / `123456`
- **查询员**: `query` / `123456`

## 项目结构

```
MicroTrace/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── dashboard/         # 仪表盘
│   ├── samples/           # 样本管理
│   ├── locations/         # 位置管理
│   ├── documents/         # 单据管理
│   ├── ledger/            # 流水查询
│   ├── trace/             # 溯源查询
│   ├── reports/           # 报表
│   └── audit-logs/        # 操作日志
├── components/            # React组件
├── lib/                  # 工具函数
│   ├── prisma.ts         # Prisma客户端
│   ├── auth.ts           # 认证相关
│   ├── document.ts       # 单据业务逻辑
│   └── audit.ts          # 操作日志
├── prisma/               # Prisma配置
│   ├── schema.prisma     # 数据库模型
│   └── seed.ts           # 种子数据
└── package.json
```

## 数据库模型

- **User**: 用户表（角色、权限）
- **SampleMaster**: 样本主数据
- **Location**: 存储位置
- **Document**: 单据（入库/出库/返库/销毁）
- **DocumentLine**: 单据明细行
- **Transaction**: 库存流水
- **AuditLog**: 操作日志

## 权限说明

- **录入岗(INPUT)**: 可创建和编辑样本、单据（草稿状态）
- **审核岗(AUDIT)**: 可审核单据、查看敏感字段、查看操作日志
- **查询岗(QUERY)**: 只能查看数据，不能编辑
- **管理员(ADMIN)**: 拥有所有权限

## 验收要点

✅ 审核前不影响库存，审核后才写入库存流水  
✅ 出库不能透支（审核时校验）  
✅ 返库必须关联原出库且数量校验  
✅ 小数库存计算正确  
✅ 敏感字段权限控制在页面和导出中均生效  

## 开发说明

### 数据库管理

```bash
# 查看数据库（Prisma Studio）
pnpm db:studio

# 重置数据库
rm prisma/dev.db
pnpm prisma db push
pnpm db:seed
```

### 环境变量

当前使用SQLite本地数据库，无需配置环境变量。如需使用其他数据库，可在 `.env` 文件中配置：

```
DATABASE_URL="file:./dev.db"
```

## 注意事项

1. 数据库文件位于 `prisma/dev.db`，请勿删除
2. 敏感字段（患者信息）仅管理员和审核岗可见
3. 单据审核后无法修改，只能查看
4. Excel导入功能需要严格按照模板格式

## 许可证

MIT

