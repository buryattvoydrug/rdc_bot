import TelegramApi from 'node-telegram-bot-api';
import * as dotenv from "dotenv";

dotenv.config();

const bot = new TelegramApi(process.env.API_KEY || '', {polling: true});

bot.setMyCommands([
  {command: '/start', description: 'Старт!'},
])

bot.onText(/\/start/, msg => {
  const { chat } = msg;
  let keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Получить ключ',
            callback_data: 'get_key'
          },
          {
            text: 'Я нашел ошибку',
            callback_data: 'send_review'
          },
        ]
      ],
    }
  };
  bot.sendMessage(chat.id, 'Добро пожаловать в бот RDC!', keyboard)
});

bot.on('callback_query', (query) => {
  const id = query.message?.chat.id;

  switch (query.data) {
    case 'send_review':
      bot.sendMessage(id || 0, 'Развернуто опишите вашу проблему в одном сообщении, прикрепите скриншоты');
      bot.once('message', (msg) => {
        // переслать это сообщение в чат поддержки
        bot.forwardMessage(process.env.SUPPORT_CHAT_ID || '', msg.chat.id || 0 , msg.message_id)
        //todo: делать тикеты для OneDev
        bot.sendMessage(id || 0, 'Спасибо за обратную связь, мы уже работаем над этим');
      });
      break
    case 'get_key':
      //todo: отправка api ключа по id пользователя
      bot.sendMessage(id || 0, `Ваш код для тестирования: ${process.env.TEST_CODE}`);
      break
  }

  return;
})