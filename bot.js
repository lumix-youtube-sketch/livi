const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const path = require('path');

const token = '8447413317:AAEWCdX9_W_50EHg8Z4-lJ47apW-sVUoVk8';
const bot = new TelegramBot(token, { polling: true });
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

console.log('🤖 Бот livi запущен!');

// API endpoint для создания invoice link
app.post('/api/create-invoice', async (req, res) => {
    try {
        const { amount } = req.body;
        
        console.log(`💰 Запрос на создание invoice: ${amount} Stars`);

        if (!amount || amount <= 0) {
            throw new Error('Неверная сумма');
        }

        // Создаем invoice link через Bot API
        const invoiceLink = await bot.createInvoiceLink(
            'Поддержка livi 💖',
            `Спасибо за поддержку проекта на ${amount} Stars!`,
            `donate_${Date.now()}`,
            'XTR',
            [{ label: `${amount} Stars`, amount: amount }]
        );

        console.log('✅ Invoice link создан успешно');
        
        res.json({ 
            success: true, 
            invoiceLink: invoiceLink 
        });
        
    } catch (error) {
        console.error('❌ Ошибка создания invoice:', error.message);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check для Render
app.get('/health', (req, res) => {
    res.json({ status: 'ok', bot: 'running' });
});

// Обработчик команды /start в боте
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
        chatId, 
        '👋 Добро пожаловать в livi!\n\n💫 Используйте веб-приложение для управления задачами и привычками.'
    );
});

// ОБЯЗАТЕЛЬНО: подтверждение платежа
bot.on('pre_checkout_query', (query) => {
    console.log('🔍 Pre-checkout query:', query.id);
    bot.answerPreCheckoutQuery(query.id, true);
});

// Успешная оплата
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
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Веб-приложение доступно`);
});
