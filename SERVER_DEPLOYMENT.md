# 服务器部署指南

本文档说明如何将微生物溯源管理器部署到华为服务器上。

## 📋 服务器信息

- **服务器地址**: 121.36.255.207
- **用户名**: hanxu
- **密码**: Matridx@2025
- **部署端口**: 5005（内部端口，可通过nginx反向代理到80/443）

---

## 🚀 部署步骤

### 第一步：连接到服务器

#### 使用 SSH 连接

**Mac/Linux:**
```bash
ssh hanxu@121.36.255.207
# 输入密码: Matridx@2025
```

**Windows:**
- 使用 PuTTY 或 Windows Terminal
- 主机: 121.36.255.207
- 用户名: hanxu
- 密码: Matridx@2025

---

### 第二步：检查服务器环境

连接成功后，检查必要的软件：

```bash
# 检查 Node.js
node -v
# 如果没有，需要安装 Node.js 18+ 或 20+

# 检查 npm
npm -v

# 检查 Git
git --version
```

**如果没有 Node.js，安装方法：**

```bash
# 使用 nvm 安装（推荐）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20

# 或者使用包管理器（Ubuntu/Debian）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```

---

### 第三步：创建项目目录

```bash
# 创建应用目录
mkdir -p ~/microtrace
cd ~/microtrace
```

---

### 第四步：获取代码

#### 方法一：使用 Git（推荐）

```bash
# 克隆仓库
git clone https://github.com/Bupoo123/MicroTrace.git .

# 或者如果已经克隆过，更新代码
git pull origin main
```

#### 方法二：上传代码

如果服务器无法访问 GitHub，可以在本地打包后上传：

```bash
# 在本地项目目录执行
tar -czf microtrace.tar.gz --exclude=node_modules --exclude=.next --exclude=prisma/dev.db .
```

然后使用 scp 上传：

```bash
# 在本地执行
scp microtrace.tar.gz hanxu@121.36.255.207:~/microtrace/

# 在服务器上解压
cd ~/microtrace
tar -xzf microtrace.tar.gz
```

---

### 第五步：安装依赖和初始化

```bash
cd ~/microtrace

# 安装依赖
npm install --production

# 生成 Prisma 客户端
npx prisma generate

# 创建数据库
npx prisma db push

# 初始化数据
npm run db:seed
```

---

### 第六步：构建应用

```bash
# 构建生产版本
npm run build
```

---

### 第七步：使用 PM2 管理进程（推荐）

#### 安装 PM2

```bash
npm install -g pm2
```

#### 启动应用

```bash
cd ~/microtrace

# 使用 PM2 启动
pm2 start npm --name "microtrace" -- start

# 或者使用 ecosystem 文件（推荐）
pm2 start ecosystem.config.js
```

#### PM2 常用命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs microtrace

# 重启应用
pm2 restart microtrace

# 停止应用
pm2 stop microtrace

# 删除应用
pm2 delete microtrace

# 设置开机自启
pm2 startup
pm2 save
```

---

### 第八步：配置 Nginx 反向代理（可选）

如果需要通过 80/443 端口访问，配置 Nginx：

```bash
# 安装 Nginx（如果没有）
sudo apt-get update
sudo apt-get install -y nginx

# 创建配置文件
sudo nano /etc/nginx/sites-available/microtrace
```

配置文件内容：

```nginx
server {
    listen 80;
    server_name 121.36.255.207;  # 或您的域名

    location / {
        proxy_pass http://localhost:5005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/microtrace /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

---

### 第九步：配置防火墙

```bash
# 开放 5005 端口（如果直接访问）
sudo ufw allow 5005/tcp

# 或开放 80/443 端口（如果使用 Nginx）
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 查看防火墙状态
sudo ufw status
```

---

## 🔧 生产环境配置

### 环境变量配置

创建 `.env.production` 文件：

```bash
cd ~/microtrace
nano .env.production
```

内容：

```env
NODE_ENV=production
PORT=5005
DATABASE_URL="file:./prisma/prod.db"
```

### 数据库路径

生产环境建议使用绝对路径：

修改 `prisma/schema.prisma`：

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

---

## 📝 一键部署脚本

我已经创建了服务器部署脚本，可以直接使用：

```bash
# 上传 deploy-server.sh 到服务器
chmod +x deploy-server.sh
./deploy-server.sh
```

---

## ✅ 验证部署

1. **检查进程是否运行：**
   ```bash
   pm2 status
   ```

2. **检查端口是否监听：**
   ```bash
   netstat -tlnp | grep 5005
   # 或
   ss -tlnp | grep 5005
   ```

3. **访问应用：**
   - 直接访问: http://121.36.255.207:5005
   - 或通过 Nginx: http://121.36.255.207

4. **测试登录：**
   - 使用默认账号: `admin` / `123456`

---

## 🔄 更新应用

当代码有更新时：

```bash
cd ~/microtrace

# 拉取最新代码
git pull origin main

# 安装新依赖
npm install --production

# 更新数据库（如果有变更）
npx prisma db push

# 重新构建
npm run build

# 重启应用
pm2 restart microtrace
```

---

## 🛠 故障排查

### 应用无法启动

```bash
# 查看 PM2 日志
pm2 logs microtrace

# 查看系统日志
journalctl -u microtrace -n 50

# 检查端口占用
lsof -i :5005
```

### 数据库问题

```bash
# 检查数据库文件
ls -lh ~/microtrace/prisma/*.db

# 重新初始化数据库
cd ~/microtrace
rm prisma/prod.db
npx prisma db push
npm run db:seed
```

### 权限问题

```bash
# 确保文件权限正确
chmod -R 755 ~/microtrace
chown -R hanxu:hanxu ~/microtrace
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看 PM2 日志: `pm2 logs microtrace`
2. 检查系统资源: `top`, `df -h`, `free -m`
3. 查看 Nginx 日志: `sudo tail -f /var/log/nginx/error.log`

---

## 🔒 安全建议

1. **修改默认密码**：首次登录后修改所有默认账号密码
2. **使用 HTTPS**：配置 SSL 证书（Let's Encrypt）
3. **防火墙配置**：只开放必要端口
4. **定期备份**：备份数据库文件 `prisma/prod.db`
5. **更新系统**：定期更新系统和依赖包

---

**部署完成后，应用将在 http://121.36.255.207:5005 运行！** 🎉

