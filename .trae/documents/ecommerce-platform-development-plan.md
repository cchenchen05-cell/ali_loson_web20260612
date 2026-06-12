# 电玩设备制造商电商平台 — 完整开发计划

## 项目概述

基于三份需求文档（前台官网 v3.0、后台管理系统 v1.0、测试文档 v1.0），构建一个完整的前后台统一的电商运营管理平台。前台面向终端消费者（B2B/B2C），后台面向内部运营团队。

---

## 一、技术架构确认

### 1.1 技术栈（严格按文档）

| 体系 | 技术 | 版本 | 
|------|------|------|
| 全栈框架 | Next.js | 14.x (App Router) |
| 语言 | TypeScript | 5.x |
| CSS | Tailwind CSS | 3.4 |
| 组件库 | shadcn/ui | 最新 |
| ORM | Prisma | 5.x |
| 数据库 | MySQL | 8.0+ (开发阶段可用 SQLite 替代) |
| 缓存 | Redis | 7.x (开发阶段可用内存模拟) |
| 认证 | NextAuth.js (Auth.js) | v5 |
| 动画 | Framer Motion | 最新 |
| 表单 | React Hook Form + Zod | 最新 |
| 多语言 | next-intl | 最新 |
| 图标 | Lucide React | 最新 |
| 富文本 | TipTap | 2.x |
| 图表 | Recharts | 2.x |
| 验证码 | Cloudflare Turnstile | 最新 |
| 文件存储 | 阿里云 OSS / 本地存储 | — |

### 1.2 架构决策

- ✅ 前后台共享同一 Next.js 项目，通过 App Router 路由分离
- ✅ 前台路由：`/[locale]/*`（国际化前缀）
- ✅ 后台路由：`/admin/*`
- ✅ API 路由：`/api/v1/*`（前台公开）+ `/api/v1/admin/*`（后台管理）
- ✅ 渲染策略：首页 SSR、产品列表 SSR、产品详情 ISR、关于我们 SSG

---

## 二、开发阶段划分

### 阶段 1：项目初始化与基础设施（预计工作量：大型）

**1.1 项目脚手架**
- 初始化 Next.js 14 + TypeScript 项目
- 配置 Tailwind CSS 3.4
- 集成 shadcn/ui 组件库
- 配置路径别名 (@/)
- 配置 ESLint + Prettier

**1.2 数据库与 ORM**
- Prisma Schema 设计（19 张表）
- 数据库迁移脚本
- 种子数据脚本（50 产品、20 分类、5 Banner、10 公告、10 文章、5 测试账号）
- 索引设计

**1.3 认证系统**
- NextAuth v5 配置（Credentials Provider）
- JWT 签发与验证（24h 有效期）
- 登录/登出 API
- 密码 bcryptjs 哈希
- 首次登录强制改密
- Redis 登录限流（5次/分钟/IP）

**1.4 多语言基础设施**
- next-intl 配置
- 中英文语言包（src/messages/zh.json, en.json）
- 路由中间件（locale 检测与重定向）
- 语言切换器组件

**1.5 基础组件库**
- shadcn/ui 组件安装（Button, Input, Card, Dialog, Sheet, Table, Tabs, Select, Switch, Badge, Toast, Skeleton, Pagination, Breadcrumb, DropdownMenu, Accordion, Separator, Avatar, Tooltip, Progress, ScrollArea, Command, Popover 等）
- 布局组件（Navbar, Footer, AdminLayout）
- 通用组件（ErrorBoundary, NetworkError, EmptyState, LoadingSpinner）

---

### 阶段 2：后台管理系统（预计工作量：大型）

**2.1 后台布局**
- AdminLayout（侧边栏 240px + 顶栏 64px + 内容区）
- AdminSidebar（菜单权限过滤、当前路由高亮、折叠模式）
- AdminTopbar（面包屑、通知、用户菜单）
- 响应式：移动端汉堡菜单、平板图标模式

**2.2 仪表盘 (Dashboard)**
- 统计卡片（产品总数、分类总数、文章总数、PV、今日询价）
- 趋势图表（Recharts 折线图/柱状图）
- 最新动态（操作日志、新询价）
- 快捷入口

**2.3 产品管理 (Products)**
- 产品列表（分页表格、筛选、搜索、排序）
- 新增/编辑产品（TipTap 富文本、图片上传、SEO 字段）
- 批量操作（上下架、删除、分类修改）
- CSV 批量导入
- 状态管理（草稿/已发布/已下架）
- 删除确认弹窗

**2.4 分类管理 (Categories)**
- 树形结构展示（无限级嵌套）
- 新增/编辑分类（图标、预览图、封面图上传）
- 拖拽排序（同级 + 跨级）
- 删除保护（有子分类或有产品时阻止）
- 循环引用检测

**2.5 内容管理 (Content)**
- Banner 管理（CRUD、排序、启用/禁用、有效期）
- 文章管理（CRUD、富文本、分类标签、发布调度）
- 公告管理（CRUD、置顶、有效期）
- 静态内容管理（为什么选择我们、采购流程、适宜场所、页脚、场地设计、公司介绍、产品画册、证书展示、工厂展示、联系我们）

**2.6 客户评价管理 (Reviews)**
- 评价列表（分页、筛选）
- 新增/编辑评价（关联产品、头像/视频上传、标签管理）

**2.7 数据分析 (Analytics)**
- 概览面板（PV/UV、事件总数、热门产品 TOP10）
- 趋势图表（折线图、饼图）
- 事件明细查询（时间范围、事件类型筛选）
- CSV 数据导出

**2.8 询价表单管理 (Inquiries)**
- 询价列表（分页、状态筛选）
- 状态流转（待处理→处理中→已完成/已关闭）
- 详情查看（完整信息、备注系统）

**2.9 收藏/点赞管理 (Favorites)**
- 收藏列表（按产品分组）
- likeCount 维护（定时校准任务）

**2.10 操作日志 (Audit Logs)**
- 日志列表（分页、类型/目标筛选）
- JSON diff 详情查看
- 异步写入机制

**2.11 用户管理 (Users)**
- 用户列表（仅 superadmin）
- 新增用户（16 位随机密码、首次登录强制改密）
- 编辑用户（角色变更、禁用/启用）
- 登录统计

**2.12 访客管理 (Visitors)**
- 访客列表（设备指纹识别）
- 浏览记录查看
- 会话分析

**2.13 系统设置 (Settings)**
- 站点配置（名称、Logo、SEO）
- 联系方式、社交媒体
- 邮件配置、上传配置、安全配置
- 键值对存储、动态更新

**2.14 RBAC 权限系统**
- 角色定义：superadmin / admin / editor
- 菜单级权限（中间件拦截）
- 操作级权限（按钮可见性 + API 校验）
- 数据级权限（editor 仅见自己创建的数据）
- 权限矩阵（15 个模块 × 3 种角色）

---

### 阶段 3：前台官网（预计工作量：大型）

**3.1 全局布局与导航**
- 导航栏（双主题：暗色/白色，动态切换）
- glow-menu 3D 翻转交互（Framer Motion）
- 多级 Megamenu（一级→二级→三级 + 预览图）
- 页脚（多列链接、联系方式、社交媒体）
- 右侧悬浮按钮组（喜欢、询价、返回顶部）
- 分类导航组件（移动端 Accordion）

**3.2 首页 (Home)**
- Hero Banner（视频背景 + 渐变遮罩 + CTA）
- 热门分类（横向滚动卡片）
- 热门产品（产品网格 + SpotlightCard 发光效果）
- 为什么选择我们（图标+文字网格）
- 客户评论（横向轮播）
- 服务过的客户（Logo 墙双向滚动）
- 场地设计展示（左图右文交替）
- 产品适合场所（图标网格）
- 采购流程（横向步骤条）
- 询价表单（ContactForm）
- 骨架屏加载态

**3.3 产品列表页 (Product List)**
- 面包屑导航
- GlowSearch 发光搜索框（conic-gradient 旋转动画）
- 分类侧边栏筛选
- 产品网格（4 列 Desktop / 3 列 Tablet / 2 列 Mobile）
- 分页器（40 个/页）
- 排序（综合/价格/最新）
- 筛选联动
- 搜索 debounce 500ms
- 空结果状态

**3.4 产品详情页 (Product Detail)**
- 图片查看器（全屏、缩放、左右切换）
- 产品信息（名称、价格、likeCount、简介）
- 喜欢按钮（心形动画、乐观更新）
- 富文本产品详情
- 规格参数表
- 相关产品推荐（4 个）
- 面包屑导航

**3.5 喜欢/收藏系统**
- 添加/移除喜欢（localStorage + 乐观更新）
- 喜欢列表面板（右侧滑出 400px / 移动端底部抽屉）
- 全选/单选操作
- 批量同步后端
- 未登录持久化 + 登录后合并
- 立即咨询跳转（自动填入产品）

**3.6 询价表单**
- 表单字段（姓名、电话、邮箱、预算、采购时间、地址）
- Zod 校验（手机号格式、必填字段）
- Cloudflare Turnstile 验证码
- 喜欢列表自动填入
- 表单缓存（localStorage 7 天 TTL）
- 频率限制（429 处理）
- 网络断开处理
- 提交流程（loading、防重复）

**3.7 多语言切换**
- 中英文界面即时切换
- 路由前缀切换（/zh /en）
- API lang 参数传递
- localStorage 语言持久化

**3.8 场地设计展示 (Venue Design)**
- 标签筛选（横向滚动、手势滑动）
- 单列大图展示
- 图片懒加载
- 点击放大查看

**3.9 关于我们**
- 公司介绍（时间轴设计、发展历程）
- 产品画册（网格封面、PDF 预览/下载）
- 证书展示（网格 + 分类筛选 + 放大查看）
- 工厂展示（ExpandingCards 组件）
- 文章列表与详情

**3.10 联系我们**
- 双列布局：左表单右联系信息
- 嵌入地图（百度地图/高德地图）
- 微信二维码展示

**3.11 响应式布局**
- 6 个断点（默认/sm/md/lg/xl/2xl）
- 导航栏汉堡菜单
- 产品网格自适应列数
- 响应式图片（srcset/sizes）
- 触摸手势支持
- Safe Area 适配

**3.12 动画系统**
- Framer Motion 滚动入场动画
- 喜欢按钮弹性动画
- 导航菜单 3D 翻转
- 搜索框发光旋转
- prefers-reduced-motion 尊重
- 仅对 transform 和 opacity 做动画

---

### 阶段 4：API 接口层（贯穿各阶段）

**4.1 前台公开 API**
- GET /api/v1/home（聚合接口，Redis 缓存 10min）
- GET /api/v1/products（列表，分页+筛选+排序，Redis 缓存 5min）
- GET /api/v1/products/[id]（详情，Redis 缓存 5min）
- GET /api/v1/categories（分类树，Redis 缓存 30min）
- POST /api/v1/products/batch（批量获取产品）
- POST /api/v1/favorites/sync（同步喜欢列表）
- POST /api/v1/inquiries（提交询价，限流 3次/分钟/IP）
- GET /api/v1/inquiries/options（询价选项）
- GET /api/v1/languages（语言列表）
- GET /api/v1/venue-designs（场地设计）
- GET /api/v1/about/*（关于我们子页面）
- GET /api/v1/content/*（静态内容）
- GET /api/v1/reviews（客户评价）
- POST /api/v1/upload（文件上传）

**4.2 后台管理 API**
- GET /api/v1/admin/dashboard（仪表盘）
- CRUD /api/v1/admin/products（产品管理）
- POST /api/v1/admin/products/batch（批量操作）
- GET /api/v1/admin/products/export（导出 CSV）
- CRUD /api/v1/admin/categories（分类管理）
- PUT /api/v1/admin/categories/reorder（拖拽排序）
- CRUD /api/v1/admin/banners（Banner 管理）
- CRUD /api/v1/admin/articles（文章管理）
- CRUD /api/v1/admin/announcements（公告管理）
- CRUD /api/v1/admin/static-contents（静态内容）
- CRUD /api/v1/admin/reviews（评价管理）
- GET /api/v1/admin/analytics/*（数据分析）
- CRUD /api/v1/admin/inquiries（询价管理）
- GET /api/v1/admin/favorites（收藏管理）
- GET /api/v1/admin/logs（操作日志）
- CRUD /api/v1/admin/users（用户管理，仅 superadmin）
- GET /api/v1/admin/visitors（访客管理）
- CRUD /api/v1/admin/settings（系统设置，仅 superadmin）
- POST /api/v1/admin/upload（文件上传至 OSS）

**4.3 统一规范**
- 统一响应格式：`{ code, message, data, timestamp }`
- 分页格式：`{ list, total, page, pageSize, totalPages }`
- 错误码：200/400/401/403/404/429/500/503
- 全局限流：60 次/分钟/IP（Redis 滑动窗口）
- 登录限流：5 次/分钟/IP
- 询价限流：3 次/分钟/IP

---

### 阶段 5：安全实现

- JWT 认证 + HttpOnly Secure Cookie
- bcryptjs 密码哈希（salt >= 12）
- RBAC 权限（菜单级 + 操作级 + 数据级）
- CSRF 防护（NextAuth 内置）
- XSS 防护（DOMPurify 清洗富文本）
- SQL 注入防护（Prisma 参数化查询）
- 文件上传白名单（图片/视频/文档类型 + 大小限制）
- 随机文件名（UUID）
- Cookie 安全属性（Secure + HttpOnly + SameSite=Lax）
- HSTS 头部
- API 限流（Redis 滑动窗口）

---

### 阶段 6：测试（按测试文档执行）

**6.1 功能测试（129 个用例）**
- 前台首页：7 个用例
- 前台产品列表+筛选+搜索：8 个用例
- 前台产品详情：5 个用例
- 前台询价表单：8 个用例
- 前台喜欢收藏：6 个用例
- 前台多语言：4 个用例
- 前台响应式：5 个用例
- 后台登录认证：6 个用例
- 后台产品管理：8 个用例
- 后台分类管理：5 个用例
- 后台内容管理：8 个用例
- 后台数据分析：4 个用例
- 后台询价管理：3 个用例
- RBAC 权限：8 个用例
- 操作日志：3 个用例
- 访客/用户管理：4 个用例

**6.2 接口测试（13 个用例）**
- 前台公开 API：5 个用例
- 后台管理 API：5 个用例
- 限流测试：3 个用例

**6.3 安全测试（26 个用例）**
- 认证安全：5 个用例
- 输入安全：5 个用例
- 权限测试：5 个用例
- 接口限流：3 个用例
- Cookie 安全：3 个用例
- HTTPS/TLS：3 个用例（开发环境跳过）

**6.4 性能测试**
- 首页加载性能（LCP < 2.5s, FCP < 1.5s, CLS < 0.1, TTI < 3.5s）
- 产品列表性能（虚拟滚动、分页优化）
- 数据库慢查询检测
- N+1 查询检测

**6.5 兼容性测试**
- 浏览器：Chrome/Firefox/Safari/Edge 90+
- 移动端：iOS Safari / Android Chrome
- 响应式断点验证

---

## 三、项目目录结构

```
ecommerce-platform/
├── prisma/
│   ├── schema.prisma              # 数据模型（19 张表）
│   ├── seed.ts                    # 种子数据脚本
│   └── migrations/                # 数据库迁移
├── src/
│   ├── app/
│   │   ├── [locale]/              # 前台国际化路由
│   │   │   ├── layout.tsx         # 前台布局
│   │   │   ├── page.tsx           # 首页
│   │   │   ├── products/
│   │   │   │   ├── page.tsx       # 产品列表
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx   # 产品详情
│   │   │   ├── venue/
│   │   │   │   └── page.tsx       # 场地设计
│   │   │   ├── contact/
│   │   │   │   └── page.tsx       # 联系我们
│   │   │   ├── about/
│   │   │   │   ├── intro/page.tsx
│   │   │   │   ├── catalog/page.tsx
│   │   │   │   ├── certificates/page.tsx
│   │   │   │   ├── factory/page.tsx
│   │   │   │   └── articles/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/page.tsx
│   │   │   └── not-found.tsx
│   │   ├── admin/                 # 后台管理路由
│   │   │   ├── layout.tsx         # 后台布局
│   │   │   ├── page.tsx           # 仪表盘
│   │   │   ├── products/
│   │   │   ├── categories/
│   │   │   ├── content/
│   │   │   ├── reviews/
│   │   │   ├── analytics/
│   │   │   ├── inquiries/
│   │   │   ├── favorites/
│   │   │   ├── logs/
│   │   │   ├── users/
│   │   │   ├── visitors/
│   │   │   └── settings/
│   │   └── api/
│   │       └── v1/
│   │           ├── admin/         # 后台 API
│   │           └── [前台公开 API]
│   ├── components/
│   │   ├── ui/                    # shadcn/ui 组件
│   │   ├── layout/                # 布局组件
│   │   ├── admin/                 # 后台专用组件
│   │   ├── product/               # 产品相关组件
│   │   ├── favorites/             # 喜欢收藏组件
│   │   ├── inquiry/               # 询价表单组件
│   │   ├── common/                # 通用组件
│   │   └── sections/              # 首页区块组件
│   ├── lib/
│   │   ├── auth.ts                # NextAuth 配置
│   │   ├── db.ts                  # Prisma 客户端
│   │   ├── redis.ts               # Redis 客户端
│   │   ├── permissions.ts         # 权限校验
│   │   ├── api.ts                 # API 请求封装
│   │   ├── cache.ts               # 缓存管理
│   │   ├── rate-limit.ts          # 限流工具
│   │   └── utils.ts               # 通用工具
│   ├── hooks/                     # 自定义 Hooks
│   ├── messages/                  # i18n 语言包
│   ├── types/                     # TypeScript 类型
│   └── middleware.ts              # Next.js 中间件
├── public/                        # 静态资源
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── next.config.js
├── components.json               # shadcn/ui 配置
├── docker-compose.yml
└── .env
```

---

## 四、关键决策（已确认）

### 4.1 已确认决策

| 决策项 | 确认方案 |
|--------|----------|
| **数据库** | Docker Compose 启动 MySQL 8.0 + Redis 7，与生产环境一致 |
| **外部服务** | Mock 模拟（Cloudflare Turnstile、OSS、Sentry、百度地图），保留接口结构 |
| **开发优先级** | Phase 1 → 2 → 3 → 4 → 5（按计划顺序） |
| **种子数据** | 项目初始化时自动生成（50 产品、20 分类、5 Banner、10 公告、10 文章、5 测试账号） |

### 4.2 技术框架合规性检查

已确认文档中所有技术框架均满足开发需求，无需变更：
- Next.js 14 ✅
- shadcn/ui ✅
- Prisma + MySQL ✅
- NextAuth v5 ✅
- Framer Motion ✅
- React Hook Form + Zod ✅
- next-intl ✅
- TipTap ✅
- Recharts ✅
- Tailwind CSS ✅
- Cloudflare Turnstile ✅

---

## 五、验证步骤

每个阶段完成后执行以下验证：
1. TypeScript 类型检查通过（`npx tsc --noEmit`）
2. ESLint 无错误（`npx eslint .`）
3. 开发服务器正常启动（`npm run dev`）
4. 关键页面可访问且数据正确渲染
5. API 接口返回正确格式
6. RBAC 权限正确生效
7. 响应式布局在 3 个断点下正常

---

## 六、风险提示

1. **项目体量**：完整的全栈电商平台，包含 19 张数据表、60+ API 端点、30+ 页面、129 个测试用例。

2. **富文本编辑器**：TipTap 集成需要额外配置和样式调整。

3. **国际化**：所有页面/组件需同时支持中英文，增加开发复杂度。

4. **Docker 依赖**：需要 Docker 环境运行 MySQL + Redis，确保 Docker 可用。