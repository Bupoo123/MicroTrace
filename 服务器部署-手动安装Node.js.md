# 服务器部署 - 手动安装 Node.js

如果自动安装 Node.js 失败，可以按照以下步骤手动安装。

## 方法一：使用系统包管理器（推荐，最快）

### Ubuntu/Debian 系统

```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# 安装 Node.js
sudo apt-get install -y nodejs

# 验证安装
node -v
npm -v
```

### CentOS/RHEL 系统

```bash
# 添加 NodeSource 仓库
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -

# 安装 Node.js
sudo yum install -y nodejs

# 验证安装
node -v
npm -v
```

---

## 方法二：使用 NVM（使用国内镜像）

如果包管理器安装失败，可以使用 NVM：

```bash
# 使用 gitee 镜像安装 NVM
export NVM_SOURCE=https://gitee.com/mirrors/nvm.git
curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash

# 加载 NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 设置使用淘宝镜像
export NVM_NODEJS_ORG_MIRROR=https://npmmirror.com/mirrors/node/

# 安装 Node.js 20
nvm install 20
nvm use 20
nvm alias default 20

# 验证安装
node -v
npm -v
```

---

## 方法三：直接下载二进制文件

如果以上方法都失败，可以直接下载 Node.js 二进制文件：

```bash
# 下载 Node.js 20 LTS（Linux x64）
cd /tmp
wget https://npmmirror.com/mirrors/node/v20.11.0/node-v20.11.0-linux-x64.tar.xz

# 解压
tar -xf node-v20.11.0-linux-x64.tar.xz

# 移动到系统目录
sudo mv node-v20.11.0-linux-x64 /opt/nodejs
sudo ln -s /opt/nodejs/bin/node /usr/local/bin/node
sudo ln -s /opt/nodejs/bin/npm /usr/local/bin/npm

# 验证安装
node -v
npm -v
```

---

## 配置 npm 使用国内镜像

安装完 Node.js 后，配置 npm 使用国内镜像加速：

```bash
# 设置淘宝镜像
npm config set registry https://registry.npmmirror.com

# 验证配置
npm config get registry

# 或者使用 cnpm（可选）
npm install -g cnpm --registry=https://registry.npmmirror.com
```

---

## 安装完成后继续部署

Node.js 安装完成后，继续执行部署脚本：

```bash
cd ~
./deploy-server.sh
```

或者手动执行部署步骤（参考 SERVER_DEPLOYMENT.md）

---

## 常见问题

### 问题1：curl 命令不存在

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y curl

# CentOS/RHEL
sudo yum install -y curl
```

### 问题2：权限不足

如果提示权限不足，使用 sudo：

```bash
sudo npm install -g pm2
```

### 问题3：端口被占用

检查端口占用：

```bash
# 查看5005端口
lsof -i :5005
# 或
netstat -tlnp | grep 5005
```

---

## 验证安装

安装完成后，运行以下命令验证：

```bash
# 检查 Node.js 版本
node -v
# 应该显示: v20.x.x

# 检查 npm 版本
npm -v
# 应该显示: 10.x.x

# 检查镜像源
npm config get registry
# 应该显示: https://registry.npmmirror.com/
```

如果都正常，说明安装成功！

