# 阿里云 ECS 宝塔面板部署指南

## 前置要求

- 阿里云 ECS 服务器（推荐 2核4G 以上）
- 宝塔面板已安装并运行
- 域名已解析到服务器 IP
- 已备案（国内服务器必须）

## 一、宝塔面板环境配置

### 1. 安装必要软件

在宝塔面板 -> 软件商店中安装：

- **Nginx** (1.22+)
- **MySQL** (8.0+)
- **Node.js 版本管理器** (选择 18.x 或 20.x)
- **PM2 管理器** (可选，用于进程管理)
- **Redis** (可选，用于缓存)

### 2. 创建数据库

1. 宝塔面板 -> 数据库 -> 添加数据库
2. 填写信息：
   - 数据库名：`ecommerce_platform`
   - 用户名：`ecommerce`
   - 密码：（生成强密码）
   - 访问权限：本地服务器

### 3. 创建网站

1. 宝塔面板 -> 网站 -> 添加站点
2. 填写信息：
   - 域名：`your-domain.com` 和 `www.your-domain.com`
   - 根目录：`/www/wwwroot/ecommerce-platform`
   - PHP 版本：纯静态
   - 数据库：选择刚创建的数据库

## 二、项目部署

### 方式一：使用部署脚本（推荐）

```bash
# 1. 上传项目到服务器
# 方式 A: 使用宝塔面板文件管理上传压缩包
# 方式 B: 使用 Git 克隆
cd /www/wwwroot
git clone <your-repo-url> ecommerce-platform

# 2. 执行部署脚本
cd ecommerce-platform
chmod +x deploy.sh
bash deploy.sh
```

### 方式二：手动部署

```bash
# 1. 进入项目目录
cd /www/wwwroot/ecommerce-platform

# 2. 安装 Node.js 依赖
npm install

# 3. 配置环境变量
cp .env.production.example .env
nano .env  # 编辑配置

# 4. 推送数据库结构
npx prisma db push

# 5. 导入种子数据（首次部署）
npm run db:seed

# 6. 构建项目
npm run build

# 7. 使用 PM2 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 三、环境变量配置

编辑 `/www/wwwroot/ecommerce-platform/.env`：

```bash
# 数据库（使用宝塔面板创建的数据库信息）
DATABASE_URL="mysql://ecommerce:your_password@localhost:3306/ecommerce_platform"

# NextAuth（必须修改！）
AUTH_SECRET="生成随机密钥: openssl rand -base64 32"
AUTH_URL="https://www.your-domain.com"

# Redis（如果安装了）
REDIS_URL="redis://localhost:6379"

# Cloudflare Turnstile（可选）
NEXT_PUBLIC_TURNSTILE_SITE_KEY=""
TURNSTILE_SECRET_KEY=""

# 阿里云 OSS（可选）
OSS_REGION="oss-cn-hangzhou"
OSS_ACCESS_KEY_ID=""
OSS_ACCESS_KEY_SECRET=""
OSS_BUCKET=""
OSS_ENDPOINT="https://oss-cn-hangzhou.aliyuncs.com"
```

## 四、Nginx 配置

### 方式一：宝塔面板配置（推荐）

1. 宝塔面板 -> 网站 -> 你的站点 -> 设置
2. 配置文件 -> 粘贴 `nginx.conf` 内容
3. 修改 `server_name` 为你的域名
4. 保存并重载 Nginx

### 方式二：反向代理配置

1. 宝塔面板 -> 网站 -> 你的站点 -> 设置
2. 反向代理 -> 添加反向代理
3. 填写：
   - 代理名称：`nextjs`
   - 目标URL：`http://127.0.0.1:3000`
   - 发送域名：`$host`

## 五、SSL 证书配置

1. 宝塔面板 -> 网站 -> 你的站点 -> 设置
2. SSL -> Let's Encrypt
3. 选择域名 -> 申请
4. 开启强制 HTTPS

## 六、验证部署

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs ecommerce-platform

# 测试访问
curl http://localhost:3000
```

访问你的域名检查是否正常运行。

## 七、常用运维命令

```bash
# 重启应用
pm2 restart ecommerce-platform

# 停止应用
pm2 stop ecommerce-platform

# 查看日志
pm2 logs ecommerce-platform

# 重新构建并重启
cd /www/wwwroot/ecommerce-platform
npm run build
pm2 restart ecommerce-platform

# 更新代码后重新部署
git pull
npm install
npm run build
pm2 restart ecommerce-platform
```

## 八、性能优化

### 1. 开启 Redis 缓存

安装 Redis 后，在 `.env` 中配置：
```bash
REDIS_URL="redis://localhost:6379"
```

### 2. 配置 CDN

阿里云 OSS + CDN 加速静态资源：
1. 创建 OSS Bucket
2. 配置 CDN 加速域名
3. 在 `.env` 中配置 OSS 信息

### 3. 数据库优化

宝塔面板 -> 数据库 -> 设置 -> 性能调整
- 根据服务器内存调整 innodb_buffer_pool_size

## 九、常见问题

### 1. 端口被占用

```bash
# 查看端口占用
lsof -i :3000

# 修改端口
# 编辑 ecosystem.config.js 中的 PORT
```

### 2. 内存不足

```bash
# 调整 PM2 内存限制
# 编辑 ecosystem.config.js 中的 max_memory_restart
```

### 3. 数据库连接失败

- 检查 MySQL 是否运行
- 检查 `.env` 中的数据库配置
- 检查数据库用户权限

### 4. 502 Bad Gateway

- 检查 Next.js 是否运行：`pm2 status`
- 检查 Nginx 配置
- 查看错误日志：`pm2 logs`

## 十、安全建议

1. 修改默认管理员密码
2. 配置防火墙规则
3. 定期备份数据库
4. 开启 HTTPS
5. 配置 Cloudflare Turnstile 防刷
6. 定期更新依赖包

## 管理员账号

首次部署后，使用以下账号登录后台：

- 地址：`https://your-domain.com/admin`
- 账号：`superadmin`
- 密码：`Admin@123456`

**请登录后立即修改密码！**
