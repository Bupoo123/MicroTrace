#!/bin/bash

# 快速同步到 Gitee 的脚本

echo "=========================================="
echo "  同步代码到 Gitee"
echo "=========================================="
echo ""

# 检查是否在正确的目录
if [ ! -d ".git" ]; then
    echo "❌ 错误: 当前目录不是 Git 仓库"
    exit 1
fi

# 获取 Gitee 用户名
read -p "请输入您的 Gitee 用户名 (默认: Bupoo123): " GITEE_USER
GITEE_USER=${GITEE_USER:-Bupoo123}

GITEE_URL="https://gitee.com/${GITEE_USER}/MicroTrace.git"

echo ""
echo "Gitee 仓库地址: $GITEE_URL"
echo ""

# 检查是否已添加 gitee 远程仓库
if git remote | grep -q gitee; then
    echo "✅ 已存在 gitee 远程仓库"
    read -p "是否更新地址? (y/n): " UPDATE
    if [ "$UPDATE" = "y" ]; then
        git remote set-url gitee "$GITEE_URL"
        echo "✅ 已更新 gitee 远程仓库地址"
    fi
else
    echo "添加 gitee 远程仓库..."
    git remote add gitee "$GITEE_URL"
    echo "✅ 已添加 gitee 远程仓库"
fi

echo ""
echo "正在推送到 Gitee..."
echo ""

# 推送代码
git push gitee main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 代码推送成功！"
    
    # 推送标签
    echo ""
    echo "推送标签..."
    git push gitee --tags
    
    echo ""
    echo "=========================================="
    echo "  ✅ 同步完成！"
    echo "=========================================="
    echo ""
    echo "Gitee 仓库地址: $GITEE_URL"
    echo ""
    echo "现在可以在服务器上使用 Gitee 克隆："
    echo "  git clone $GITEE_URL"
    echo ""
else
    echo ""
    echo "❌ 推送失败"
    echo ""
    echo "可能的原因："
    echo "1. Gitee 仓库不存在，请先在 Gitee 上创建仓库"
    echo "2. 用户名或仓库名不正确"
    echo "3. 没有推送权限"
    echo ""
    echo "请检查："
    echo "1. 访问 https://gitee.com 确认仓库已创建"
    echo "2. 确认仓库名称是 MicroTrace"
    echo "3. 确认您有推送权限"
    echo ""
fi

