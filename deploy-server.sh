#!/bin/bash

# 服务器部署脚本
# 用于在华为服务器上自动部署微生物溯源管理器

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  微生物溯源管理器 - 服务器部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
APP_NAME="microtrace"
APP_DIR="$HOME/microtrace"
PORT=5005

# 检查 Node.js
echo -e "${YELLOW}📦 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}未检测到 Node.js，正在安装...${NC}"
    
    # 检测系统类型
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        OS=$(uname -s)
    fi
    
    # 尝试使用 nvm（使用国内镜像）
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
        source "$HOME/.nvm/nvm.sh"
        # 设置nvm使用淘宝镜像
        export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
        nvm install 20
        nvm use 20
    else
        echo -e "${YELLOW}安装 nvm (使用国内镜像)...${NC}"
        # 使用gitee镜像安装nvm
        export NVM_SOURCE=https://gitee.com/mirrors/nvm.git
        curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash || {
            # 如果gitee也失败，尝试直接使用包管理器
            echo -e "${YELLOW}NVM安装失败，尝试使用系统包管理器...${NC}"
            if command -v apt-get &> /dev/null; then
                # Ubuntu/Debian
                curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
                sudo apt-get install -y nodejs
            elif command -v yum &> /dev/null; then
                # CentOS/RHEL
                curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
                sudo yum install -y nodejs
            else
                echo -e "${RED}❌ 无法自动安装 Node.js，请手动安装${NC}"
                echo "请访问: https://nodejs.org/ 或使用包管理器安装"
                exit 1
            fi
        }
        
        # 如果nvm安装成功，继续配置
        if [ -s "$HOME/.nvm/nvm.sh" ]; then
            export NVM_DIR="$HOME/.nvm"
            [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
            # 设置nvm使用淘宝镜像
            export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/
            nvm install 20
            nvm use 20
        fi
    fi
fi

NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
echo ""

# 检查 npm
echo -e "${YELLOW}📦 检查 npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ 未检测到 npm${NC}"
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm: v$NPM_VERSION${NC}"
echo ""

# 创建应用目录
echo -e "${YELLOW}📁 创建应用目录...${NC}"
mkdir -p "$APP_DIR"
cd "$APP_DIR"
echo -e "${GREEN}✅ 目录: $APP_DIR${NC}"
echo ""

# 检查是否已有代码
if [ -d ".git" ]; then
    echo -e "${YELLOW}🔄 更新代码...${NC}"
    # 优先使用gitee，如果失败再尝试github
    git pull gitee main 2>/dev/null || git pull origin main 2>/dev/null || echo -e "${YELLOW}⚠️  Git pull 失败，继续使用现有代码${NC}"
else
    echo -e "${YELLOW}📥 克隆代码...${NC}"
    if [ -d ".git" ] || [ "$(ls -A $APP_DIR)" ]; then
        echo -e "${YELLOW}⚠️  目录不为空，跳过克隆${NC}"
    else
        # 优先使用gitee镜像（国内访问快）
        echo -e "${YELLOW}尝试从 Gitee 克隆（国内镜像）...${NC}"
        git clone https://gitee.com/bupoo/MicroTrace.git . 2>/dev/null || {
            echo -e "${YELLOW}Gitee 克隆失败，尝试 GitHub...${NC}"
            git clone https://github.com/Bupoo123/MicroTrace.git . || {
                echo -e "${RED}❌ Git 克隆失败${NC}"
                echo -e "${YELLOW}请手动克隆代码：${NC}"
                echo "  git clone https://gitee.com/Bupoo123/MicroTrace.git ."
                echo "  或"
                echo "  git clone https://github.com/Bupoo123/MicroTrace.git ."
                exit 1
            }
        }
        # 添加gitee作为远程仓库（如果从github克隆）
        if ! git remote | grep -q gitee; then
            git remote add gitee https://gitee.com/bupoo/MicroTrace.git 2>/dev/null || true
        fi
    fi
fi
echo ""

# 配置npm使用国内镜像
echo -e "${YELLOW}⚙️  配置npm镜像源...${NC}"
npm config set registry https://registry.npmmirror.com
echo -e "${GREEN}✅ npm镜像源已配置${NC}"
echo ""

# 安装依赖（生产环境也需要devDependencies来构建）
echo -e "${YELLOW}📥 安装依赖...${NC}"
npm install
echo -e "${GREEN}✅ 依赖安装完成${NC}"
echo ""

# 生成 Prisma 客户端
echo -e "${YELLOW}🔧 生成 Prisma 客户端...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma 客户端生成完成${NC}"
echo ""

# 创建数据库
echo -e "${YELLOW}💾 创建数据库...${NC}"
npx prisma db push
echo -e "${GREEN}✅ 数据库创建完成${NC}"
echo ""

# 初始化数据（如果数据库为空）
if [ ! -f "prisma/prod.db" ] && [ ! -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}🌱 初始化数据...${NC}"
    npm run db:seed
    echo -e "${GREEN}✅ 数据初始化完成${NC}"
else
    echo -e "${YELLOW}⚠️  数据库已存在，跳过初始化${NC}"
fi
echo ""

# 构建应用
echo -e "${YELLOW}🏗️  构建应用...${NC}"
npm run build
echo -e "${GREEN}✅ 构建完成${NC}"
echo ""

# 检查 PM2
echo -e "${YELLOW}📦 检查 PM2...${NC}"
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}安装 PM2...${NC}"
    npm install -g pm2 --registry=https://registry.npmmirror.com
    # 如果全局安装失败，尝试本地安装
    if ! command -v pm2 &> /dev/null; then
        echo -e "${YELLOW}全局安装失败，尝试本地安装...${NC}"
        npm install pm2 --registry=https://registry.npmmirror.com
        # 创建软链接或使用 npx
        export PATH="$PATH:$(pwd)/node_modules/.bin"
    fi
fi

# 验证 PM2
if command -v pm2 &> /dev/null || [ -f "node_modules/.bin/pm2" ]; then
    echo -e "${GREEN}✅ PM2 已安装${NC}"
else
    echo -e "${RED}❌ PM2 安装失败${NC}"
    echo -e "${YELLOW}尝试手动安装: npm install -g pm2${NC}"
    exit 1
fi
echo ""

# 停止旧进程（如果存在）
echo -e "${YELLOW}🛑 停止旧进程...${NC}"
pm2 delete "$APP_NAME" 2>/dev/null || echo -e "${YELLOW}⚠️  没有运行中的进程${NC}"
echo ""

# 启动应用
echo -e "${YELLOW}🚀 启动应用...${NC}"
cd "$APP_DIR"

# 使用 pm2 或 npx pm2
if command -v pm2 &> /dev/null; then
    PM2_CMD="pm2"
else
    PM2_CMD="npx pm2"
fi

$PM2_CMD start npm --name "$APP_NAME" -- start
echo -e "${GREEN}✅ 应用已启动${NC}"
echo ""

# 保存 PM2 配置
echo -e "${YELLOW}💾 保存 PM2 配置...${NC}"
$PM2_CMD save 2>/dev/null || echo -e "${YELLOW}⚠️  PM2 save 失败，跳过${NC}"
echo ""

# 显示状态
echo "=========================================="
echo -e "${GREEN}  ✅ 部署完成！${NC}"
echo "=========================================="
echo ""
echo "📊 应用状态："
$PM2_CMD status "$APP_NAME" 2>/dev/null || echo -e "${YELLOW}⚠️  无法查看状态，请手动检查${NC}"
echo ""
echo "📝 默认账号："
echo "  管理员: admin / 123456"
echo "  录入员: input / 123456"
echo "  审核员: audit / 123456"
echo "  查询员: query / 123456"
echo ""
echo "🌐 访问地址："
echo "  http://121.36.255.207:$PORT"
echo ""
echo "📋 常用命令："
echo "  查看日志: pm2 logs $APP_NAME"
echo "  重启应用: pm2 restart $APP_NAME"
echo "  停止应用: pm2 stop $APP_NAME"
echo "  查看状态: pm2 status"
echo ""

