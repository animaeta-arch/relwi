const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const messageHandler = require('./handlers/messageHandler');
const imageHandler = require('./handlers/imageHandler');
const logger = require('./utils/logger');

// Создаем экземпляр бота
const bot = new TelegramBot(config.TELEGRAM_BOT_TOKEN, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = `
🤖 *Добро пожаловать в ИИ Код-Генератор!*

Я могу помочь вам с:
• 💻 Генерацией кода на любых языках программирования
• 🖼️ Анализом и описанием изображений с кодом
• 🔧 Созданием сложных программных решений
• 📚 Обучением и объяснением концепций программирования
• 🚀 *Автоматическим деплоем на серверы 24/7!*

*Команды:*
/start - Начать работу
/help - Справка и список платформ для деплоя
/code - Генерация кода
/analyze - Анализ изображения
/deploy - Информация о деплое

🎯 *Просто отправьте запрос, получите код и задеплойте его одной кнопкой!*
    `;
    
    bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
    logger.info(`New user started bot: ${msg.from.username || msg.from.id}`);
});

// Обработчик команды /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpMessage = `
📖 *Справка по использованию бота*

*Что я умею:*
• Писать код на Python, JavaScript, HTML/CSS, SQL, Java, C++, Go, Rust и других языках
• Создавать телеграм ботов, веб-приложения, API
• Анализировать изображения и извлекать код из скриншотов
• Объяснять сложные концепции программирования
• Решать алгоритмические задачи
• 🚀 *Деплоить созданный код на серверы 24/7!*

*Как использовать:*
1️⃣ Опишите что вам нужно создать
2️⃣ Укажите язык программирования (если важно)
3️⃣ Отправьте изображение с кодом для анализа
4️⃣ Задавайте уточняющие вопросы
5️⃣ Используйте кнопки для деплоя на серверы

*Платформы для деплоя:*
🆓 Replit - быстрый деплой, 24/7 работа
🆓 Vercel - для фронтенда и веб-приложений
🆓 Netlify - для статических сайтов
🆓 Railway - универсальный хостинг
🆓 Render - веб-сервисы

*Примеры запросов:*
• "Создай телеграм бота на Python"
• "Напиши API для управления пользователями на Node.js"  
• "Как решить эту задачу?" + изображение
• "Объясни как работает этот код" + скриншот
• После создания кода жми "🚀 Задеплоить код"

Просто напишите свой запрос!
    `;
    
    bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Обработчик команды /code
bot.onText(/\/code/, (msg) => {
    const chatId = msg.chat.id;
    const codeMessage = `
💻 *Генератор кода готов к работе!*

Опишите что вам нужно создать:
• Язык программирования
• Функциональность
• Особые требования

*Пример запроса:*
"Создай Python скрипт для парсинга веб-сайтов с использованием requests и BeautifulSoup"

🚀 *После создания кода используйте кнопки для автоматического деплоя!*

Отправьте ваш запрос следующим сообщением.
    `;
    
    bot.sendMessage(chatId, codeMessage, { parse_mode: 'Markdown' });
});

// Обработчик команды /deploy
bot.onText(/\/deploy/, (msg) => {
    const chatId = msg.chat.id;
    const deployMessage = `
🚀 *Автоматический деплой кода*

*Поддерживаемые платформы:*

🆓 **Replit** - Быстрый деплой, работает 24/7
• Поддержка всех языков
• Reserved VM для постоянной работы  
• Встроенная база данных

🆓 **Vercel** - Идеально для фронтенда
• Next.js, React, Vue.js
• Автоматический SSL
• CDN по всему миру

🆓 **Netlify** - Для статических сайтов
• JAMstack приложения
• Формы и функции
• Интеграция с Git

🆓 **Railway** - Универсальный хостинг
• Любые приложения
• Автоматический деплой
• Базы данных

🆓 **Render** - Веб-сервисы
• Python, Node.js, Go
• Docker поддержка
• Автоматические SSL

*Как использовать:*
1. Создайте код с помощью бота
2. Нажмите "🚀 Задеплоить код"
3. Выберите платформу
4. Получите готовые файлы проекта
5. Следуйте инструкциям для деплоя

*Все проекты создаются со всеми необходимыми файлами для деплоя!*
    `;
    
    bot.sendMessage(chatId, deployMessage, { parse_mode: 'Markdown' });
});

// Обработчик текстовых сообщений
bot.on('message', async (msg) => {
    // Игнорируем команды
    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    // Обработка изображений
    if (msg.photo) {
        await imageHandler.handleImage(bot, msg);
        return;
    }

    // Обработка текстовых сообщений
    if (msg.text) {
        await messageHandler.handleTextMessage(bot, msg);
        return;
    }
});

// Обработчик callback запросов от inline кнопок
bot.on('callback_query', async (callbackQuery) => {
    await messageHandler.handleCallbackQuery(bot, callbackQuery);
});

// Обработчик ошибок
bot.on('polling_error', (error) => {
    logger.error('Polling error:', error);
});

// Обработчик webhook ошибок
bot.on('webhook_error', (error) => {
    logger.error('Webhook error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    logger.info('Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

logger.info('Telegram bot started successfully!');
logger.info('Bot username:', config.TELEGRAM_BOT_TOKEN.split(':')[0]);

// Запускаем health check сервер для некоторых платформ
if (process.env.NODE_ENV === 'production') {
    require('./health-check.js');
}
