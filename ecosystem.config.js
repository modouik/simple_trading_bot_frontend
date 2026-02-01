module.exports = {
    apps: [{
      name: 'nextjs-trading-bot-dashboard',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/newwaydev/html',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/www/newwaydev/log/error.log',
      out_file: '/var/www/newwaydev/log/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }]
  }