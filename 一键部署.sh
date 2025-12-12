#!/bin/bash

# 微生物溯源管理器 - 一键部署脚本
# 适用于 Mac 和 Linux 系统

echo "=========================================="
echo "  微生物溯源管理器 - 一键部署脚本"
echo "=========================================="
echo ""

# 检查 Node.js
echo "📦 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未检测到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 已安装: $NODE_VERSION"
echo ""

# 检查 npm
echo "📦 检查 npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未检测到 npm"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "✅ npm 已安装: v$NPM_VERSION"
echo ""

# 安装依赖
echo "📥 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi

echo "✅ 依赖安装完成"
echo ""

# 生成 Prisma 客户端
echo "🔧 正在生成 Prisma 客户端..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma 客户端生成失败"
    exit 1
fi

echo "✅ Prisma 客户端生成完成"
echo ""

# 创建数据库
echo "💾 正在创建数据库..."
npx prisma db push

if [ $? -ne 0 ]; then
    echo "❌ 数据库创建失败"
    exit 1
fi

echo "✅ 数据库创建完成"
echo ""

# 初始化数据
echo "🌱 正在初始化数据..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ 数据初始化失败"
    exit 1
fi

echo "✅ 数据初始化完成"
echo ""

echo "=========================================="
echo "  ✅ 部署完成！"
echo "=========================================="
echo ""
echo "📝 默认账号："
echo "  管理员: admin / 123456"
echo "  录入员: input / 123456"
echo "  审核员: audit / 123456"
echo "  查询员: query / 123456"
echo ""
echo "🚀 启动应用："
echo "  npm run dev"
echo ""
echo "🌐 访问地址："
echo "  http://localhost:5005"
echo ""
echo "⚠️  提示：启动后请保持终端窗口打开"
echo ""

