#!/bin/bash
# ============================================
# 宝塔面板部署脚本 - Next.js 电商平台
# 使用方式: bash deploy.sh
# ============================================

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置变量（请根据实际情况修改）
APP_NAME="ecommerce-platform"
APP_DIR="/www/wwwroot/${APP_NAME}"
LOG_DIR="/www/wwwlogs"
NODE_VERSION="18"

# 打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查是否以 root 运行
check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "请使用 root 用户运行此脚本"
        exit 1
    fi
}

# 检查 Node.js
check_node() {
    print_info "检查 Node.js 版本..."
    if ! command -v node &> /dev/null; then
        print_warn "Node.js 未安装，请在宝塔面板中安装 Node.js ${NODE_VERSION}+"
        print_info "宝塔面板 -> 软件商店 -> 搜索 Node.js 版本管理器 -> 安装"
        exit 1
    fi
    
    NODE_VER=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VER" -lt 18 ]; then
        print_error "Node.js 版本过低 ($(node -v))，需要 18 或更高版本"
        exit 1
    fi
    print_info "Node.js 版本: $(node -v)"
}

# 检查 PM2
check_pm2() {
    print_info "检查 PM2..."
    if ! command -v pm2 &> /dev/null; then
        print_info "安装 PM2..."
        npm install -g pm2
    fi
    print_info "PM2 版本: $(pm2 -v)"
}

# 创建目录
create_dirs() {
    print_info "创建应用目录..."
    mkdir -p "$APP_DIR"
    mkdir -p "$LOG_DIR"
    mkdir -p "${APP_DIR}/public/uploads"
}

# 复制文件
copy_files() {
    print_info "复制项目文件..."
    
    # 排除不需要的文件
    rsync -av --progress \
        --exclude='node_modules' \
        --exclude='.next' \
        --exclude='.env' \
        --exclude='.env.local' \
        --exclude='*.log' \
        ./ "$APP_DIR/"
}

# 安装依赖
install_deps() {
    print_info "安装依赖..."
    cd "$APP_DIR"
    npm install --production=false
}

# 配置环境变量
setup_env() {
    print_info "配置环境变量..."
    cd "$APP_DIR"
    
    if [ ! -f .env ]; then
        if [ -f .env.production.example ]; then
            cp .env.production.example .env
            print_warn "已创建 .env 文件，请编辑配置: ${APP_DIR}/.env"
            print_warn "必须修改: DATABASE_URL, AUTH_SECRET, AUTH_URL"
        else
            print_error "未找到 .env.production.example 文件"
            exit 1
        fi
    else
        print_info ".env 文件已存在，跳过"
    fi
}

# 构建项目
build_project() {
    print_info "构建项目..."
    cd "$APP_DIR"
    npm run build
}

# 推送数据库结构
setup_database() {
    print_info "推送数据库结构..."
    cd "$APP_DIR"
    npx prisma db push
    
    print_info "导入种子数据（首次部署）..."
    read -p "是否导入种子数据？(首次部署选 y，更新部署选 n) [y/N]: " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:seed
    fi
}

# 启动应用
start_app() {
    print_info "启动应用..."
    cd "$APP_DIR"
    
    # 停止旧进程
    pm2 delete "$APP_NAME" 2>/dev/null || true
    
    # 启动新进程
    pm2 start ecosystem.config.js
    
    # 保存 PM2 配置
    pm2 save
    
    # 设置开机自启
    pm2 startup systemd -u root --hp /root 2>/dev/null || true
    
    print_info "应用已启动"
}

# 显示状态
show_status() {
    print_info "应用状态:"
    pm2 status
    
    echo ""
    print_info "============================================"
    print_info "部署完成！"
    print_info "============================================"
    print_info "应用目录: ${APP_DIR}"
    print_info "日志目录: ${LOG_DIR}"
    print_info ""
    print_info "常用命令:"
    print_info "  查看日志: pm2 logs ${APP_NAME}"
    print_info "  重启应用: pm2 restart ${APP_NAME}"
    print_info "  停止应用: pm2 stop ${APP_NAME}"
    print_info "  查看状态: pm2 status"
    print_info ""
    print_warn "下一步:"
    print_warn "1. 编辑环境变量: nano ${APP_DIR}/.env"
    print_warn "2. 配置 Nginx 反向代理（见 nginx.conf）"
    print_warn "3. 在宝塔面板添加站点并配置 SSL"
    print_info "============================================"
}

# 主流程
main() {
    print_info "开始部署 Next.js 电商平台..."
    echo ""
    
    check_root
    check_node
    check_pm2
    create_dirs
    copy_files
    install_deps
    setup_env
    build_project
    setup_database
    start_app
    show_status
}

# 运行主流程
main
