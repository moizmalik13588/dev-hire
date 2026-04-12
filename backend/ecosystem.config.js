export default {
  apps: [
    {
      name: "devhire-api",
      script: "src/index.js",
      instances: "max", // CPU cores ke barabar instances
      exec_mode: "cluster", // Cluster mode
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      max_memory_restart: "1G", // 1GB se zyada memory use kare toh restart
    },
  ],
};
