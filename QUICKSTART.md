# 快速启动指南

## 一键运行

```bash
cd /Users/bupoo/Github/MicroTrace
npm install && npx prisma generate && npx prisma db push && npm run db:seed && npm run dev
```

或者分步执行：

```bash
# 1. 安装依赖
npm install

# 2. 生成Prisma客户端
npx prisma generate

# 3. 创建数据库
npx prisma db push

# 4. 初始化数据（创建默认用户和位置）
npm run db:seed

# 5. 启动开发服务器
npm run dev
```

## 访问应用

打开浏览器访问：http://localhost:5005

## 默认账号

- **管理员**: `admin` / `123456`
- **录入员**: `input` / `123456`
- **审核员**: `audit` / `123456`
- **查询员**: `query` / `123456`

## 功能说明

1. **登录**: 使用上述任一账号登录
2. **样本管理**: 创建和管理样本主数据
3. **位置管理**: 管理存储位置
4. **单据管理**: 创建入库/出库/返库/销毁单据
5. **流水查询**: 查看库存流水并导出Excel
6. **溯源查询**: 按样本编码或单据号查询完整轨迹
7. **报表**: 查看库存台账
8. **操作日志**: 查看系统操作记录（管理员/审核员可见）

## 注意事项

- 数据库文件位于 `prisma/dev.db`
- 首次运行需要执行初始化步骤
- 敏感字段（患者信息）仅管理员和审核员可见

