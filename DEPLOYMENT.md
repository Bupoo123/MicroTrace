# 本地部署标准操作程序 (SOP)

本文档提供详细的本地部署步骤，适合不熟悉技术的用户。

## 📋 前置要求

在开始之前，请确保您的电脑已安装以下软件：

### 1. Node.js（必需）

**检查是否已安装：**
- 打开终端（Terminal）或命令提示符（CMD）
- 输入命令：`node -v`
- 如果显示版本号（如 v18.x.x 或 v20.x.x），说明已安装
- 如果没有显示或报错，需要安装

**安装方法：**
1. 访问 https://nodejs.org/
2. 下载 LTS 版本（推荐）
3. 双击安装包，按提示完成安装
4. 安装完成后，重新打开终端，再次输入 `node -v` 确认

### 2. Git（必需）

**检查是否已安装：**
- 打开终端
- 输入命令：`git --version`
- 如果显示版本号，说明已安装

**安装方法：**
- **Mac**: 通常已预装，如果没有，访问 https://git-scm.com/download/mac
- **Windows**: 访问 https://git-scm.com/download/win 下载安装

---

## 🚀 部署步骤

### ⚡ 快速部署（推荐）

如果您使用的是 **Mac 或 Linux**：
```bash
# 进入项目目录后，直接运行：
./一键部署.sh
```

如果您使用的是 **Windows**：
```cmd
# 进入项目目录后，双击运行：
一键部署.bat
```

脚本会自动完成所有部署步骤。完成后，运行 `npm run dev` 启动应用。

---

### 📝 手动部署步骤

如果您想了解详细步骤，或脚本执行失败，可以按照以下步骤手动操作：

### 第一步：获取代码

#### 方法一：使用 Git（推荐）

1. 打开终端（Mac）或 Git Bash（Windows）
2. 进入您想要存放项目的目录，例如：
   ```bash
   cd ~/Desktop
   ```
   或
   ```bash
   cd D:\Projects
   ```
3. 克隆仓库：
   ```bash
   git clone https://github.com/Bupoo123/MicroTrace.git
   ```
4. 进入项目目录：
   ```bash
   cd MicroTrace
   ```

#### 方法二：直接下载 ZIP

1. 访问 https://github.com/Bupoo123/MicroTrace
2. 点击绿色的 "Code" 按钮
3. 选择 "Download ZIP"
4. 解压 ZIP 文件到您想要的目录
5. 打开终端，进入解压后的目录：
   ```bash
   cd ~/Downloads/MicroTrace
   ```
   （请根据实际路径调整）

---

### 第二步：安装依赖

1. 确保您在项目目录中（终端显示路径包含 MicroTrace）
2. 输入以下命令安装依赖：
   ```bash
   npm install
   ```
3. 等待安装完成（可能需要 2-5 分钟）
   - 如果看到 "added XXX packages" 表示成功
   - 如果出现错误，请参考"常见问题"部分

---

### 第三步：初始化数据库

#### 3.1 生成数据库客户端

```bash
npx prisma generate
```

等待看到 "✔ Generated Prisma Client" 表示成功。

#### 3.2 创建数据库

```bash
npx prisma db push
```

等待看到 "Your database is now in sync" 表示成功。

#### 3.3 初始化数据（创建默认用户）

```bash
npm run db:seed
```

等待看到以下信息表示成功：
```
数据库初始化完成！
默认账号：
  管理员: admin / 123456
  录入员: input / 123456
  审核员: audit / 123456
  查询员: query / 123456
```

---

### 第四步：启动应用

输入以下命令启动应用：

```bash
npm run dev
```

**成功标志：**
- 看到类似以下信息：
  ```
  ▲ Next.js 14.0.4
  - Local:        http://localhost:5005
  - Ready in 2.3s
  ```
- 终端不会返回命令提示符（这是正常的，应用正在运行）

**⚠️ 重要提示：**
- **不要关闭这个终端窗口**，关闭后应用会停止
- 如果需要停止应用，按 `Ctrl + C`（Mac 上按 `Cmd + C`）

---

### 第五步：访问应用

1. 打开浏览器（Chrome、Firefox、Safari 等）
2. 在地址栏输入：`http://localhost:5005`
3. 按回车键
4. 应该看到登录页面

**如果无法访问，请检查：**
- 确认终端显示应用已启动（看到 "Ready" 信息）
- 确认地址输入正确：`http://localhost:5005`（注意是 5005，不是 3000）
- 尝试刷新页面（F5 或 Cmd+R）

---

### 第六步：登录系统

使用以下任一账号登录：

| 角色 | 用户名 | 密码 | 权限说明 |
|------|--------|------|----------|
| 管理员 | `admin` | `123456` | 所有权限 |
| 录入员 | `input` | `123456` | 可创建样本和单据 |
| 审核员 | `audit` | `123456` | 可审核单据，查看敏感信息 |
| 查询员 | `query` | `123456` | 只能查看数据 |

**建议：** 首次使用建议用 `admin` 账号登录，体验完整功能。

---

## 📝 日常使用

### 启动应用

每次使用前，需要：

1. 打开终端
2. 进入项目目录：
   ```bash
   cd ~/Desktop/MicroTrace
   ```
   （请根据实际路径调整）
3. 启动应用：
   ```bash
   npm run dev
   ```
4. 在浏览器访问：`http://localhost:5005`

### 停止应用

在运行应用的终端窗口中，按 `Ctrl + C`（Mac 上按 `Cmd + C`）

---

## ❓ 常见问题

### 问题1：`npm install` 很慢或失败

**解决方案：**
1. 检查网络连接
2. 如果在中国大陆，可以使用淘宝镜像：
   ```bash
   npm install --registry=https://registry.npmmirror.com
   ```

### 问题2：端口 5005 已被占用

**错误信息：** `Port 5005 is already in use`

**解决方案：**
1. 找到占用端口的程序并关闭
2. 或者修改端口（需要修改 `package.json` 中的端口号）

### 问题3：数据库相关错误

**错误信息：** `Prisma schema validation error` 或 `Database not found`

**解决方案：**
1. 删除数据库文件（如果存在）：
   ```bash
   rm prisma/dev.db
   ```
   （Windows 上：`del prisma\dev.db`）
2. 重新执行第三步的所有命令

### 问题4：无法访问 http://localhost:5005

**检查清单：**
- [ ] 确认应用已启动（终端显示 "Ready"）
- [ ] 确认地址输入正确（注意是 5005 端口）
- [ ] 尝试使用 `http://127.0.0.1:5005`
- [ ] 检查防火墙设置
- [ ] 尝试重启应用

### 问题5：忘记项目路径

**解决方案：**
- 在终端输入 `pwd`（Mac/Linux）或 `cd`（Windows）查看当前路径
- 使用文件管理器找到项目文件夹，然后右键选择"在终端中打开"

### 问题6：Git 克隆失败

**解决方案：**
- 如果网络问题，使用"方法二：直接下载 ZIP"
- 或者配置 Git 代理

---

## 🔄 更新代码

如果代码有更新，需要获取最新版本：

```bash
# 进入项目目录
cd ~/Desktop/MicroTrace

# 拉取最新代码
git pull

# 重新安装依赖（如果有新的依赖）
npm install

# 更新数据库（如果有数据库变更）
npx prisma db push

# 重启应用
npm run dev
```

---

## 📞 获取帮助

如果遇到问题无法解决：

1. 检查本文档的"常见问题"部分
2. 查看项目 README.md 文件
3. 联系项目维护者

---

## ✅ 部署检查清单

完成部署后，请确认：

- [ ] Node.js 已安装（`node -v` 有输出）
- [ ] 项目代码已下载到本地
- [ ] 依赖已安装（`npm install` 成功）
- [ ] 数据库已创建（`npx prisma db push` 成功）
- [ ] 默认用户已创建（`npm run db:seed` 成功）
- [ ] 应用已启动（`npm run dev` 显示 "Ready"）
- [ ] 浏览器可以访问 `http://localhost:5005`
- [ ] 可以使用默认账号登录

---

**祝您使用愉快！** 🎉

