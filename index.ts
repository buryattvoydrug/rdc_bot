import TelegramApi from 'node-telegram-bot-api';
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import tokenRoute from './routes/token'
import axios from 'axios';
import Token from './models/Token';
import { getTokenByTelegramID } from './utils/token';


dotenv.config();

const bot = new TelegramApi(process.env.API_KEY || '', {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL || '').then((res) => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.log(error);
});

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

bot.on('callback_query', async (query) => {
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
      const tokenWithOwner = await getTokenByTelegramID(query.from.id.toString());
      if (tokenWithOwner) {
        bot.sendMessage(id || 0, `Вы уже получали код для тестирования`);
      } else {
        // bot.sendMessage(id || 0, `Ваш код для тестирования: ${token?.token}`);
        // выдать новый токен
      }
      break
  }

  return;
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))