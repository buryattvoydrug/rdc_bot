import TelegramApi from 'node-telegram-bot-api';
import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import tokenRoute from "./routes/token"
import { generateToken, getNewToken, getTokenByTelegramID, resetToken } from './utils/token';

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
        //если уже выдавали токен, то отказ
        bot.sendMessage(id || 0, `Вы уже получали код для тестирования`);
        // generateToken();
      } else {
        //если не выдавали токен, то выдаем новый токен
        const newToken = await getNewToken(query.from.id.toString());
        if (newToken) {
          await bot.sendMessage(id || 0, `Ваш код для тестирования: ${newToken?.token}. Ваша ссылка: https://rdc.club/promo?id=${query.from.id.toString()}&code=${newToken}`);
          //освобождаем токен если пользователь не успел залогиниться за 10 минут (600000 мс)
          resetToken(query.from.id.toString(), 600000);
        }
        else {
          await bot.sendMessage(id || 0, `Токены закончились`);
        }
      }
      break
  }
  return;
})

app.use("/api/token", tokenRoute);

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))