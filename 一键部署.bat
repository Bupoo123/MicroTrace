@echo off
chcp 65001 >nul
REM 微生物溯源管理器 - 一键部署脚本 (Windows)

echo ==========================================
echo   微生物溯源管理器 - 一键部署脚本
echo ==========================================
echo.

REM 检查 Node.js
echo 📦 检查 Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 已安装: %NODE_VERSION%
echo.

REM 检查 npm
echo 📦 检查 npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误: 未检测到 npm
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm 已安装: v%NPM_VERSION%
echo.

REM 安装依赖
echo 📥 正在安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)
echo ✅ 依赖安装完成
echo.

REM 生成 Prisma 客户端
echo 🔧 正在生成 Prisma 客户端...
call npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Prisma 客户端生成失败
    pause
    exit /b 1
)
echo ✅ Prisma 客户端生成完成
echo.

REM 创建数据库
echo 💾 正在创建数据库...
call npx prisma db push
if %errorlevel% neq 0 (
    echo ❌ 数据库创建失败
    pause
    exit /b 1
)
echo ✅ 数据库创建完成
echo.

REM 初始化数据
echo 🌱 正在初始化数据...
call npm run db:seed
if %errorlevel% neq 0 (
    echo ❌ 数据初始化失败
    pause
    exit /b 1
)
echo ✅ 数据初始化完成
echo.

echo ==========================================
echo   ✅ 部署完成！
echo ==========================================
echo.
echo 📝 默认账号：
echo   管理员: admin / 123456
echo   录入员: input / 123456
echo   审核员: audit / 123456
echo   查询员: query / 123456
echo.
echo 🚀 启动应用：
echo   npm run dev
echo.
echo 🌐 访问地址：
echo   http://localhost:5005
echo.
echo ⚠️  提示：启动后请保持命令窗口打开
echo.
pause

