const TelegramBot = require('node-telegram-bot-api');

// ============================================
// 🔧 НАСТРОЙКИ - ИЗМЕНИТЕ ЭТИ ЗНАЧЕНИЯ
// ============================================

// Токен бота от @BotFather
const BOT_TOKEN = '8447413317:AAEWCdX9_W_50EHg8Z4-lJ47apW-sVUoVk8';

// Username бота (без @)
const BOT_USERNAME = 'livi_app_bot';

// URL вашего Web App
const WEB_APP_URL = 'https://lumix-youtube-sketch.github.io/livi/';

// Ваш Telegram ID для админ-команд (узнайте у @userinfobot)
const ADMIN_ID = 1792666312; // ← ЗАМЕНИТЕ НА ВАШ ID

// Контакты для поддержки
const SUPPORT_USERNAME = '@NoLumiXXX'; // ← ЗАМЕНИТЕ
const SUPPORT_EMAIL = 'lumix3567@mail.ru'; // ← ЗАМЕНИТЕ

// ============================================
// КОД БОТА - НЕ ИЗМЕНЯЙТЕ НИЖЕ
// ============================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log('🤖 Livi Bot запущен!');
console.log(`📱 Username: @${BOT_USERNAME}`);
console.log(`🌐 Web App: ${WEB_APP_URL}`);

// Обработка ошибок
bot.on('polling_error', (error) => {
    console.error('❌ Ошибка polling:', error.code, error.message);
});

// Команда /start
bot.onText(/\/start$/, (msg) => {
    const chatId = msg.chat.id;
    const firstName = msg.from.first_name || 'друг';

    bot.sendMessage(
        chatId,
        `👋 Привет, ${firstName}!\n\n` +
        `Добро пожаловать в **livi** — твой помощник в формировании привычек и управлении задачами!\n\n` +
        `✨ Нажми кнопку ниже, чтобы начать!`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🚀 Открыть приложение',
                        web_app: { url: WEB_APP_URL }
                    }
                ]]
            }
        }
    );
});

// Команда /start stars_X (платежи)
bot.onText(/\/start stars_(\d+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const amount = parseInt(match[1]);

    console.log(`💰 Запрос платежа: ${amount} Stars от @${username} (${userId})`);

    try {
        await bot.sendInvoice(
            chatId,
            '⭐ Поддержка livi', // Заголовок
            `Спасибо за вашу поддержку!\n\nВы отправляете ${amount} Telegram Stars разработчикам livi.`, // Описание
            `payment_${userId}_${amount}_${Date.now()}`, // Уникальный payload
            '', // provider_token - пустая строка для Stars
            'XTR', // Валюта - ОБЯЗАТЕЛЬНО XTR для Stars
            [{ label: `${amount} Stars`, amount: amount }], // Цены
            {
                need_name: false,
                need_phone_number: false,
                need_email: false,
                need_shipping_address: false,
                is_flexible: false
            }
        );

        console.log(`✅ Invoice отправлен`);

    } catch (error) {
        console.error('❌ Ошибка создания invoice:', error.message);
        bot.sendMessage(
            chatId,
            '⚠️ Произошла ошибка при создании платежа.\n\n' +
            'Пожалуйста, попробуйте позже или обратитесь в поддержку: /paysupport'
        );
    }
});

// ОБЯЗАТЕЛЬНО: Подтверждение pre-checkout
bot.on('pre_checkout_query', async (query) => {
    const queryId = query.id;
    const userId = query.from.id;
    const amount = query.total_amount;

    console.log(`🔍 Pre-checkout: ${amount} Stars от ${userId}`);

    try {
        // Здесь можно добавить проверки:
        // - Доступность товара
        // - Лимиты пользователя
        // - Черный список

        await bot.answerPreCheckoutQuery(queryId, true);
        console.log('✅ Pre-checkout подтвержден');

    } catch (error) {
        console.error('❌ Ошибка pre-checkout:', error);

        // Отклоняем платеж с причиной
        await bot.answerPreCheckoutQuery(
            queryId,
            false,
            { error_message: 'Временные технические неполадки. Попробуйте позже.' }
        );
    }
});

// Успешный платеж
bot.on('successful_payment', async (msg) => {
    const payment = msg.successful_payment;
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || msg.from.first_name;
    const amount = payment.total_amount;
    const chargeId = payment.telegram_payment_charge_id;
    const invoicePayload = payment.invoice_payload;

    console.log('');
    console.log('🎉 =============== ПЛАТЕЖ УСПЕШЕН ===============');
    console.log(`   Пользователь: @${username} (ID: ${userId})`);
    console.log(`   Сумма: ${amount} Stars`);
    console.log(`   Charge ID: ${chargeId}`);
    console.log(`   Payload: ${invoicePayload}`);
    console.log(`   Дата: ${new Date().toLocaleString('ru-RU')}`);
    console.log('================================================');
    console.log('');

    // TODO: Сохраните chargeId в базу данных для возможных refund!
    // Например: await db.savePayment({ userId, amount, chargeId, date: new Date() });

    // Отправляем благодарность
    await bot.sendMessage(
        chatId,
        `🎉 Огромное спасибо за поддержку!\n\n` +
        `💫 Вы отправили **${amount} Stars**\n\n` +
        `💖 Ваша поддержка помогает развивать livi и добавлять новые функции!\n\n` +
        `✨ Приятного использования!`,
        {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '🚀 Вернуться в приложение',
                        web_app: { url: WEB_APP_URL }
                    }
                ]]
            }
        }
    );
});

// Команда /paysupport (ОБЯЗАТЕЛЬНАЯ по правилам Telegram)
bot.onText(/\/paysupport/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `💬 **Поддержка платежей livi**\n\n` +
        `Если у вас возникли вопросы или проблемы с платежами:\n\n` +
        `📱 Telegram: ${SUPPORT_USERNAME}\n` +
        `📧 Email: ${SUPPORT_EMAIL}\n\n` +
        `⏱ Мы отвечаем в течение 24 часов.\n\n` +
        `_Примечание: Поддержка Telegram не сможет помочь с вопросами о платежах в боте._`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /terms (РЕКОМЕНДУЕТСЯ)
bot.onText(/\/terms/, (msg) => {
    bot.sendMessage(
        msg.chat.id,
        `📜 **Условия использования livi**\n\n` +
        `1. **Услуга**: livi предоставляет цифровые инструменты для отслеживания привычек и задач.\n\n` +
        `2. **Платежи**: Все платежи осуществляются в Telegram Stars (XTR).\n\n` +
        `3. **Возвраты**: Возврат средств возможен в течение 48 часов после покупки при наличии технических проблем.\n\n` +
        `4. **Поддержка**: По вопросам обращайтесь: /paysupport\n\n` +
        `5. **Ответственность**: Используя бота, вы соглашаетесь с данными условиями.\n\n` +
        `Полная версия: ${WEB_APP_URL}terms`,
        { parse_mode: 'Markdown' }
    );
});

// Команда /refund (только для админа)
bot.onText(/\/refund (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const chargeId = match[1].trim();

    // Проверка прав
    if (userId !== ADMIN_ID) {
        return bot.sendMessage(chatId, '❌ У вас нет прав для выполнения этой команды.');
    }

    console.log(`💸 Запрос на возврат: ${chargeId} от админа ${userId}`);

    try {
        await bot.refundStarPayment(userId, chargeId);

        bot.sendMessage(chatId, `✅ Возврат успешно выполнен!\n\nCharge ID: \`${chargeId}\``, { parse_mode: 'Markdown' });
        console.log(`✅ Возврат выполнен: ${chargeId}`);

    } catch (error) {
        bot.sendMessage(chatId, `❌ Ошибка возврата: ${error.message}`);
        console.error('❌ Ошибка возврата:', error);
    }
});

// Команда /stats (только для админа)
bot.onText(/\/stats/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    if (userId !== ADMIN_ID) {
        return bot.sendMessage(chatId, '❌ У вас нет прав для выполнения этой команды.');
    }

    // TODO: Получить статистику из базы данных
    bot.sendMessage(
        chatId,
        `📊 **Статистика платежей**\n\n` +
        `_Функция в разработке_\n\n` +
        `Для просмотра статистики подключите базу данных.`,
        { parse_mode: 'Markdown' }
    );
});

console.log('✅ Бот готов принимать платежи через Telegram Stars!');
console.log('📝 Доступные команды:');
console.log('   /start - Запуск бота');
console.log('   /paysupport - Поддержка платежей');
console.log('   /terms - Условия использования');
console.log('   /refund <charge_id> - Возврат (только админ)');
console.log('   /stats - Статистика (только админ)');
console.log('');