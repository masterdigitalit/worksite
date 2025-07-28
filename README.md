# Запуск приложения (замени app.js на свой entrypoint, например: npm run start)
pm2 start npm --name "my-next-app" -- run dev

# Просмотр списка запущенных процессов
pm2 list

# Перезапуск приложения по имени
pm2 restart my-next-app

# Остановка приложения
pm2 stop my-next-app

# Удаление приложения из pm2
pm2 delete my-app

# Мониторинг ресурсов (CPU, память и т.д.)
pm2 monit

# Просмотр логов приложения
pm2 logs my-next-app

# Сохранение текущей конфигурации процессов
pm2 save

# Включение автозапуска PM2 при перезагрузке сервера
pm2 startup

# Копировать команду, которую выведет pm2 startup, и выполнить её (обычно это sudo команда)

# Примеры логов
pm2 logs          # Все логи
pm2 logs my-next-app   # Логи конкретного приложения

# Очистка логов
pm2 flush
