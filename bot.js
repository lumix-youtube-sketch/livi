const TelegramBot = require('node-telegram-bot-api');

// ЗАМЕНИТЕ на ваш токен от @BotFather
const token = 'ВАХХХ_ТОКЕН_БОТА';

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Бот livi запущен!');

// Обычная команда /start
bot.onText(/\/start$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 Добро пожаловать в livi!\n\n💫 Используйте веб-приложение для управления задачами и привычками.');
});

// Команда /start donate_X (приходит из веб-приложения)
bot.onText(/\/start donate_(\d+)/, async (msg, match) => {
    const userId = msg.from.id;
    const amount = parseInt(match[1]);

    console.log(`💰 Запрос платежа: ${amount} Stars от пользователя ${userId}`);

    try {
        await bot.sendInvoice(
            userId,
            'Поддержка livi 💖', // Заголовок
            `Спасибо за поддержку! Вы отправляете ${amount} Stars`, // Описание
            `donate_${amount}_${Date.now()}`, // Уникальный payload
            '', // provider_token (для Stars пустая строка)
            'XTR', // Валюта - Telegram Stars
            [{ label: `${amount} Stars`, amount: amount }] // Цена
        );
    } catch (error) {
        console.error('❌ Ошибка:', error);
        bot.sendMessage(userId, '⚠️ Не удалось создать платеж. Попробуйте позже.');
    }
});

// Подтверждение платежа (ОБЯЗАТЕЛЬНО!)
bot.on('pre_checkout_query', (query) => {
    console.log('🔍 Pre-checkout:', query.id);
    bot.answerPreCheckoutQuery(query.id, true);
});

// Успешный платеж
bot.on('successful_payment', (msg) => {
    const amount = msg.successful_payment.total_amount;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    console.log(`✅ Платеж получен: ${amount} Stars от @${username} (${userId})`);

    bot.sendMessage(
        userId,
        `🎉 Огромное спасибо за поддержку!\n\n💫 Вы отправили ${amount} Stars\n\n💖 Ваша поддержка помогает развивать livi!`
    );
});

console.log('✅ Бот готов принимать платежи!');