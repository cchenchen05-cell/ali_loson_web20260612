import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.productLike.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.review.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.loginRecord.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.article.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.staticContent.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.translation.deleteMany();
  await prisma.visitor.deleteMany();
  await prisma.user.deleteMany();

  // Create admin users
  const passwordHash = await bcrypt.hash("Admin@123456", 12);
  const superadmin = await prisma.user.create({
    data: {
      username: "superadmin",
      email: "superadmin@example.com",
      passwordHash,
      role: "superadmin",
      firstLogin: false,
    },
  });
  await prisma.user.create({
    data: {
      username: "admin",
      email: "admin@example.com",
      passwordHash,
      role: "admin",
      firstLogin: false,
    },
  });
  await prisma.user.create({
    data: {
      username: "editor",
      email: "editor@example.com",
      passwordHash,
      role: "editor",
      firstLogin: false,
    },
  });
  console.log("Users created");

  // Create categories
  const categories = [
    { name: "拳击机", slug: "boxing-machine", icon: "🥊", description: "专业拳击机系列" },
    { name: "娃娃机", slug: "claw-machine", icon: "🧸", description: "抓娃娃机系列" },
    { name: "赛车机", slug: "racing-machine", icon: "🏎️", description: "赛车游戏机系列" },
    { name: "VR设备", slug: "vr-equipment", icon: "🥽", description: "VR虚拟现实设备" },
    { name: "娱乐设备", slug: "entertainment", icon: "🎮", description: "综合娱乐设备" },
    { name: "游戏机", slug: "game-machine", icon: "🕹️", description: "街机游戏机系列" },
  ];

  const createdCategories = [];
  for (let i = 0; i < categories.length; i++) {
    const cat = await prisma.category.create({
      data: { ...categories[i], sortOrder: i },
    });
    createdCategories.push(cat);
    // Create subcategories
    const subNames = [
      [`迷你${categories[i].name}`, `大型${categories[i].name}`, `专业${categories[i].name}`],
      [`迷你${categories[i].name}`, `商用${categories[i].name}`],
      [`迷你${categories[i].name}`, `豪华${categories[i].name}`],
      [`入门${categories[i].name}`, `高级${categories[i].name}`],
      [`迷你${categories[i].name}`, `大型${categories[i].name}`],
      [`迷你${categories[i].name}`, `经典${categories[i].name}`],
    ];
    for (let j = 0; j < Math.min(subNames[i].length, 2); j++) {
      await prisma.category.create({
        data: {
          name: subNames[i][j],
          slug: `${categories[i].slug}-${j + 1}`,
          parentId: cat.id,
          sortOrder: j,
        },
      });
    }
  }
  console.log("Categories created");

  // Create 50 products
  const productNames = [
    "超级拳击机 Pro", "迷你拳击机 Lite", "经典拳击机 Classic", "商用拳击机 Max", "儿童拳击机 Kids",
    "大型娃娃机 Deluxe", "迷你娃娃机 Mini", "双人娃娃机 Duo", "豪华娃娃机 Premium", "主题娃娃机 Theme",
    "极速赛车机 Turbo", "漂移赛车机 Drift", "双人赛车机 Twin", "儿童赛车机 Junior", "VR赛车机 VR",
    "VR过山车 Coaster", "VR射击 Shooter", "VR探险 Explorer", "VR飞行 Pilot", "VR恐怖 Horror",
    "投篮机 Basketball", "打地鼠 Whack", "射击游戏 Shooting", "音乐游戏 Music", "跳舞机 Dance",
    "经典街机 Arcade", "格斗游戏 Fighting", "射击街机 Shooter Arcade", "泡泡龙 Puzzle", "赛车街机 Racing Arcade",
    "力量测试 Strength", "反应测试 Reaction", "幸运大转盘 Lucky", "弹珠台 Pinball", "冰球台 Hockey",
    "足球台 Football", "篮球机 Hoops", "飞镖机 Darts", "桌球台 Billiards", "保龄球 Bowling",
    "儿童乐园 Playground", "充气城堡 Bounce", "海洋球池 Ball Pit", "滑梯乐园 Slide", "蹦床公园 Trampoline",
    "模拟飞行 Flight Sim", "模拟驾驶 Drive Sim", "模拟射击 Gun Sim", "模拟滑雪 Ski Sim", "模拟冲浪 Surf Sim",
  ];

  const statuses = ["published", "published", "published", "published", "draft"];
  for (let i = 0; i < productNames.length; i++) {
    const catIndex = i % categories.length;
    const price = [8800, 12800, 16800, 24800, 35800, 4800, 6800, 9800, 15800, 28800][i % 10];
    const likeBase = Math.floor(Math.random() * 951) + 50;
    await prisma.product.create({
      data: {
        categoryId: createdCategories[catIndex].id,
        createdBy: superadmin.id,
        name: productNames[i],
        slug: productNames[i].toLowerCase().replace(/\s+/g, "-"),
        summary: `${productNames[i]} - 高品质电玩设备，适合各类娱乐场所`,
        description: `<h2>${productNames[i]}</h2><p>专业电玩设备制造商，采用优质材料和先进技术，确保设备稳定性和耐用性。</p><ul><li>高品质材料</li><li>稳定性能</li><li>安全可靠</li><li>一年质保</li></ul>`,
        price,
        likeBase,
        actualLikeCount: Math.floor(Math.random() * 200),
        status: statuses[i % statuses.length],
        featured: i < 12,
        sortOrder: i,
        coverImage: `https://images.unsplash.com/photo-${1510000000 + i}?w=800&h=800&fit=crop`,
        specifications: JSON.stringify([
          { key: "尺寸", value: `${1200 + Math.floor(Math.random() * 800)}×${800 + Math.floor(Math.random() * 600)}×${1800 + Math.floor(Math.random() * 400)}mm` },
          { key: "重量", value: `${50 + Math.floor(Math.random() * 150)}kg` },
          { key: "功率", value: `${200 + Math.floor(Math.random() * 500)}W` },
          { key: "电压", value: "220V/50Hz" },
          { key: "适用年龄", value: "3岁以上" },
        ]),
        publishedAt: new Date(),
        translations: JSON.stringify({
          zh: { name: productNames[i] },
          en: { name: productNames[i] },
        }),
      },
    });
  }
  console.log("50 Products created");

  // Create banners
  for (let i = 0; i < 5; i++) {
    await prisma.banner.create({
      data: {
        title: `Banner ${i + 1}`,
        imageUrl: `https://images.unsplash.com/photo-${1520000000 + i}?w=1920&h=600&fit=crop`,
        sortOrder: i,
        isActive: true,
      },
    });
  }
  console.log("Banners created");

  // Create announcements
  const announcements = [
    "新品发布：2026年新款拳击机系列正式上线！",
    "五一促销活动：全场产品95折优惠，限时进行中",
    "工厂扩建完成：产能提升50%，交期缩短至15天",
    "诚招全国代理商：携手共赢，共创未来",
  ];
  for (const ann of announcements) {
    await prisma.announcement.create({ data: { content: ann, isPinned: false } });
  }
  console.log("Announcements created");

  // Create articles
  const articles = [
    { title: "如何选择适合自己的电玩设备？", content: "<p>选择电玩设备时，需要考虑场地大小、目标客户群、预算等因素...</p>", tags: "选购指南" },
    { title: "买机器一定要注意的几件事", content: "<p>购买电玩设备前，请务必确认设备的售后服务、保修期限、配件供应...</p>", tags: "购买须知" },
    { title: "2026年电玩行业趋势分析", content: "<p>随着VR技术的发展，沉浸式体验成为电玩行业的新趋势...</p>", tags: "行业资讯" },
    { title: "游乐场设备布局设计指南", content: "<p>合理的设备布局能够提升客户体验和运营效率...</p>", tags: "运营指南" },
    { title: "电玩设备日常维护保养要点", content: "<p>定期维护保养可以延长设备使用寿命，减少故障率...</p>", tags: "维护保养" },
  ];
  for (const article of articles) {
    await prisma.article.create({
      data: {
        ...article,
        slug: article.title.toLowerCase().replace(/\s+/g, "-").slice(0, 50),
        status: "published",
        publishedAt: new Date(),
        createdBy: superadmin.id,
      },
    });
  }
  console.log("Articles created");

  // Create reviews
  const reviews = [
    { clientName: "张先生", content: "拳击机质量非常好，运行稳定，客户反馈很棒！", rating: 5, tags: "质量好,服务好" },
    { clientName: "李经理", content: "采购了10台娃娃机，到货快，安装调试也很专业", rating: 5, tags: "性价比高,发货快" },
    { clientName: "王总", content: "工厂实力雄厚，定制能力很强，满足了我们所有需求", rating: 5, tags: "定制服务,专业" },
    { clientName: "赵女士", content: "售后服务非常到位，有问题随时响应", rating: 4, tags: "售后好,响应快" },
    { clientName: "陈老板", content: "已经合作三年了，设备一直很稳定，还会继续合作", rating: 5, tags: "老客户,稳定可靠" },
  ];
  for (const review of reviews) {
    await prisma.review.create({
      data: {
        ...review,
        status: "published",
        createdBy: superadmin.id,
      },
    });
  }
  console.log("Reviews created");

  // Create static contents
  const staticContents = [
    { key: "why-choose-us", title: "为什么选择我们", content: JSON.stringify([
      { title: "源头工厂", description: "自建工厂，省去中间环节，价格更具竞争力", icon: "Factory" },
      { title: "品质保证", description: "严格质检流程，每台设备出厂前经过72小时老化测试", icon: "ShieldCheck" },
      { title: "定制服务", description: "OEM/ODM定制，从设计到生产一站式服务", icon: "Palette" },
      { title: "快速交付", description: "标准产品7天内发货，紧急订单可加急处理", icon: "Truck" },
      { title: "专业售后", description: "一年质保，终身维护，7×24小时技术支持", icon: "Wrench" },
      { title: "全球物流", description: "支持海运、空运、陆运，全球可达", icon: "Globe" },
    ]) },
    { key: "purchase-process", title: "采购流程", content: JSON.stringify([
      { step: 1, title: "需求沟通", description: "告诉我们您的需求和预算" },
      { step: 2, title: "方案定制", description: "我们为您定制专属方案" },
      { step: 3, title: "确认下单", description: "确认方案后签订合同" },
      { step: 4, title: "生产制造", description: "工厂按标准生产制造" },
      { step: 5, title: "质检发货", description: "严格质检后安排发货" },
    ]) },
    { key: "suitable-venues", title: "适宜场所", content: JSON.stringify([
      { name: "游乐场", icon: "FerrisWheel" },
      { name: "商场", icon: "Building2" },
      { name: "电玩城", icon: "Gamepad2" },
      { name: "儿童乐园", icon: "Baby" },
      { name: "主题公园", icon: "TreePine" },
      { name: "酒店度假村", icon: "Hotel" },
    ]) },
    { key: "footer", title: "页脚信息", content: JSON.stringify({
      companyName: "电玩设备有限公司",
      address: "广东省广州市番禺区",
      phone: "+86 400-123-4567",
      email: "info@example.com",
      workingHours: "周一至周五 9:00-18:00",
    }) },
  ];
  for (const sc of staticContents) {
    await prisma.staticContent.create({ data: sc });
  }
  console.log("Static contents created");

  // Create settings
  const settings = [
    { key: "site_name", value: "电玩设备有限公司", group: "site" },
    { key: "site_description", value: "专业电玩设备源头工厂制造商", group: "site" },
    { key: "contact_phone", value: "+86 400-123-4567", group: "contact" },
    { key: "contact_email", value: "info@example.com", group: "contact" },
    { key: "contact_address", value: "广东省广州市番禺区", group: "contact" },
    { key: "contact_working_hours", value: "周一至周五 9:00-18:00", group: "contact" },
    { key: "social_facebook", value: "https://facebook.com/example", group: "social" },
    { key: "social_twitter", value: "https://twitter.com/example", group: "social" },
    { key: "social_linkedin", value: "https://linkedin.com/company/example", group: "social" },
    { key: "social_youtube", value: "https://youtube.com/@example", group: "social" },
  ];
  for (const setting of settings) {
    await prisma.setting.create({ data: setting });
  }
  console.log("Settings created");

  console.log("Seed completed successfully!");
  console.log("---");
  console.log("Test accounts (password: Admin@123456):");
  console.log("  superadmin / Admin@123456 (all permissions)");
  console.log("  admin / Admin@123456 (business operations)");
  console.log("  editor / Admin@123456 (limited access)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });