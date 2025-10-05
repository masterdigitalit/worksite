module.exports = {
  apps: [
    {
      name: "telegram-bot", // имя процесса
      script: "./index.js", // путь до бота
      exec_mode: "fork",    // можно "cluster" если хочешь балансировку (но для бота fork лучше)
      instances: 1,         // количество экземпляров
      watch: false,         // выключено, чтобы не следить за файлами в продакшене
      autorestart: true,    // авто-перезапуск при падении
      max_restarts: 20,     // максимум рестартов подряд
      min_uptime: "30s",    // минимальное время работы, чтобы не ушёл в restart loop
      time: true,           // добавлять timestamp в логи

      // контроль памяти
      max_memory_restart: "150M", // перезапуск если память выше 150Мб

      // Логи
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Переменные окружения
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
