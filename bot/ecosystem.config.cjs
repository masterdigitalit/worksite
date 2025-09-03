module.exports = {
  apps: [
    {
      name: "telegram-bot",         // имя процесса
      script: "./index.js",           // путь до твоего файла с ботом
      watch: false,                 // можно включить true, если хочешь автоперезапуск при изменениях
      autorestart: true,            // перезапуск при падении
      max_restarts: 10,             // максимум рестартов подряд
      time: true,                   // добавлять время в логах
      error_file: "./logs/error.log",   // файл для ошибок
      out_file: "./logs/out.log",       // файл для обычных логов
      log_date_format: "YYYY-MM-DD HH:mm:ss", // формат времени в логах
    },
  ],
};
