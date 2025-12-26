const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// ЗАМЕНИТЕ на ваш токен от @BotFather
const token = '8447413317:AAEWCdX9_W_50EHg8Z4-lJ47apW-sVUoVk8';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

// Статический хостинг для index.html
app.use(express.static('.'));

console.log('🤖 Бот livi запущен!');

// API для создания invoice link
app.post('/create-invoice', async (req, res) => {
    try {
        const { amount } = req.body;
        
        console.log(`💰 Создание invoice на ${amount} Stars`);

        // Создаем invoice link
        const invoiceLink = await bot.createInvoiceLink(
            'Поддержка livi 💖',
            `Спасибо за поддержку проекта на ${amount} Stars!`,
            `donate_${Date.now()}`,
            'XTR',
            [{ label: `${amount} Stars`, amount: amount }]
        );

        console.log('✅ Invoice link создан');
        res.json({ success: true, invoiceLink });
        
    } catch (error) {
        console.error('❌ Ошибка создания invoice:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Обычная команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 Добро пожаловать в livi!\n\n💫 Используйте веб-приложение для управления задачами и привычками.');
});

// Подтверждение платежа (ОБЯЗАТЕЛЬНО!)
bot.on('pre_checkout_query', (query) => {
    console.log('🔍 Pre-checkout запрос:', query.id);
    bot.answerPreCheckoutQuery(query.id, true);
});

// Успешный платеж
bot.on('successful_payment', (msg) => {
    const amount = msg.successful_payment.total_amount;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;

    console.log(`✅ Платеж получен: ${amount} Stars от @${username}`);

    bot.sendMessage(
        userId,
        `🎉 Огромное спасибо за поддержку!\n\n💫 Вы отправили ${amount} Stars\n\n💖 Ваша поддержка помогает развивать livi!`
    );
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
    console.log(`📱 Откройте веб-приложение в Telegram`);
});
