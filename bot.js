const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

// ЗАМЕНИТЕ на ваш токен от @BotFather
const token = '8447413317:AAEWCdX9_W_50EHg8Z4-lJ47apW-sVUoVk8';

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());

console.log('🤖 Бот livi запущен!');

// API endpoint для создания invoice
app.post('/create-invoice', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        
        console.log(`💰 Создание invoice: ${amount} Stars для пользователя ${userId}`);

        const invoice = await bot.createInvoiceLink(
            'Поддержка livi 💖', // title
            `Спасибо за поддержку проекта на ${amount} Stars!`, // description
            `donate_${userId}_${amount}_${Date.now()}`, // payload
            'XTR', // currency (Telegram Stars)
            [{ label: `${amount} Stars`, amount: amount }], // prices
            {
                // Дополнительные параметры
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false,
                is_flexible: false
            }
        );

        res.json({ invoiceLink: invoice });
    } catch (error) {
        console.error('❌ Ошибка создания invoice:', error);
        res.status(500).json({ error: 'Не удалось создать invoice' });
    }
});

// Обычная команда /start
bot.onText(/\/start$/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, '👋 Добро пожаловать в livi!\n\n💫 Используйте веб-приложение для управления задачами и привычками.');
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

// Запуск веб-сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🌐 Сервер запущен на порту ${PORT}`);
});
