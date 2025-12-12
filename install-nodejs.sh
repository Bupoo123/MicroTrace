#!/bin/bash

# Node.js 安装脚本（使用国内镜像）

echo "=========================================="
echo "  Node.js 安装脚本（国内镜像）"
echo "=========================================="
echo ""

# 检测系统类型
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    OS=$(uname -s)
fi

echo "检测到系统: $OS $VERSION"
echo ""

# 方法1: 使用系统包管理器（推荐，最快）
if command -v apt-get &> /dev/null; then
    echo "使用 apt-get 安装 Node.js..."
    # Ubuntu/Debian - 使用NodeSource（支持国内访问）
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
elif command -v yum &> /dev/null; then
    echo "使用 yum 安装 Node.js..."
    # CentOS/RHEL
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
    
elif command -v dnf &> /dev/null; then
    echo "使用 dnf 安装 Node.js..."
    # Fedora
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo dnf install -y nodejs
    
else
    echo "未检测到支持的包管理器，尝试使用NVM..."
    
    # 方法2: 使用NVM（使用国内镜像）
    if [ ! -d "$HOME/.nvm" ]; then
        echo "安装 NVM (使用gitee镜像)..."
        export NVM_SOURCE=https://gitee.com/mirrors/nvm.git
        curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash
        
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    else
        export NVM_DIR="$HOME/.nvm"
        [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    fi
    
    # 设置nvm使用淘宝镜像
    export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
    nvm install 20
    nvm use 20
    nvm alias default 20
fi

# 验证安装
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    echo ""
    echo "=========================================="
    echo "  ✅ Node.js 安装成功！"
    echo "=========================================="
    echo "  Node.js: $NODE_VERSION"
    echo "  npm: v$NPM_VERSION"
    echo ""
    
    # 配置npm使用国内镜像
    echo "配置npm使用淘宝镜像..."
    npm config set registry https://registry.npmmirror.com
    echo "✅ npm镜像源已配置"
    echo ""
else
    echo "❌ Node.js 安装失败"
    exit 1
fi

