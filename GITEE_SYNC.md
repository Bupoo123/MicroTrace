# Gitee 同步指南

由于 GitHub 在国内访问可能较慢，建议同时使用 Gitee 作为镜像仓库。

## 📋 在 Gitee 上创建仓库

1. 访问 https://gitee.com
2. 登录您的账号（如果没有，先注册）
3. 点击右上角 "+" → "新建仓库"
4. 仓库名称：`MicroTrace`
5. 选择"公开"或"私有"
6. **不要**初始化仓库（保持空白）
7. 点击"创建"

## 🔄 同步代码到 Gitee

### 方法一：在本地添加 Gitee 远程仓库

```bash
cd /Users/bupoo/Github/MicroTrace

# 添加 Gitee 远程仓库
git remote add gitee https://gitee.com/您的用户名/MicroTrace.git

# 推送代码到 Gitee
git push gitee main

# 推送所有标签
git push gitee --tags
```

### 方法二：使用 Gitee 的导入功能

1. 登录 Gitee
2. 点击右上角 "+" → "导入仓库"
3. 选择"从 GitHub/GitLab 导入"
4. 输入 GitHub 仓库地址：`https://github.com/Bupoo123/MicroTrace`
5. 点击"导入"

## 🔄 后续同步

以后每次更新代码后，同时推送到两个仓库：

```bash
# 推送到 GitHub
git push origin main

# 推送到 Gitee
git push gitee main

# 推送标签
git push origin --tags
git push gitee --tags
```

## 🚀 使用 Gitee 部署

部署脚本已更新，会优先使用 Gitee 镜像：

```bash
# 在服务器上
git clone https://gitee.com/您的用户名/MicroTrace.git microtrace
cd microtrace
./deploy-server.sh
```

## 📝 更新部署脚本中的 Gitee 地址

如果您的 Gitee 用户名不是 `Bupoo123`，需要修改 `deploy-server.sh` 中的 Gitee 地址：

```bash
# 找到这一行
git clone https://gitee.com/Bupoo123/MicroTrace.git .

# 改为您的 Gitee 用户名
git clone https://gitee.com/您的用户名/MicroTrace.git .
```

## ✅ 验证同步

在 Gitee 仓库页面检查：
- 代码文件是否完整
- 提交历史是否正确
- 标签是否已同步

---

**提示**：Gitee 访问速度快，特别适合国内服务器部署！

