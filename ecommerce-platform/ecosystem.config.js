// PM2 进程管理配置
// 使用方式: pm2 start ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "ecommerce-platform",
      script: "node_modules/next/dist/bin/next",
      args: "start",
      cwd: "/www/wwwroot/ecommerce-platform",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      // 日志配置
      error_file: "/www/wwwlogs/ecommerce-platform-error.log",
      out_file: "/www/wwwlogs/ecommerce-platform-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      // 重启策略
      kill_timeout: 5000,
      listen_timeout: 10000,
      // 集群模式（如果服务器配置高，可改为 'max'）
      exec_mode: "fork",
    },
  ],
};
