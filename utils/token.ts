import Token from "../models/Token";
import { v4 as uuidv4 } from 'uuid';

/**
 * getTokenByTelegramID
 * проверяется получал ли уже пользователь токен
 * есть ли для такого tg_id токен со статусом pending
 * @param telegramId 
 * @returns token
 */
export const getTokenByTelegramID = async (telegramId: string) => {
  try {
    const token = await Token.findOne({ telegramId: telegramId });
    console.log(token)
    return token;
  } catch (err) {
    console.log(err);
  }
}

/**
 * getNewToken
 * отправляем свободный токен, имеющий статус init
 * и устанавливаем для токена статус pending
 * @param telegramId 
 * @returns new token
 */
export const getNewToken = async (telegramId: string) => {
  try {
    const token = await Token.findOneAndUpdate({ 
      status: 'init' 
    }, { 
      telegramId: telegramId, 
      status: 'pending' 
    });
    console.log(token)
    return token;
  } catch (err) {
    console.log(err);
  }
}

/**
 * resetToken
 * для токена со статусом pending устанавливается статус init
 * @param telegramId 
 * @returns 
 */
export const resetToken = (telegramId: string, time: number) => {
  setTimeout(async () => {
    try {
      const token = await Token.findOneAndUpdate({ 
        status: 'pending', 
        telegramId: telegramId 
      }, { 
        status: 'init', 
        telegramId: '' 
      });
      if (token) {
        console.log('reset')
      }
    } catch (err) {
      console.log(err);
    }
  }, time)

  
}

/**
 * success token
 * устанавливается для токена со статусом pending статус success
 * если пользователь залогинился
 * @param telegramId 
 * @returns  
 */
export const successToken = async (telegramId: string, userId: string) => {
  try {
    const token = await Token.findOneAndUpdate({ 
      status: 'pending', 
      telegramId: telegramId 
    }, { 
      status: 'success',
      userId: userId
    });
    return token;
  } catch (err) {
    console.log(err);
  }
}

export const generateToken = async () => {
  try {
    const newToken = new Token({
      token: uuidv4(),
      telegramId: '',
      userId: '',
      status: 'init',
    })
    const savedToken = await newToken.save()
    return savedToken;
  } catch (err) {
    console.log(err);
  }
}

