import Token from "../models/Token";

// get token by teleram id 
// проверяю получал ли уже пользователь токен
// есть ли для такого tg_id токен со статусом pending
export const getTokenByTelegramID = async (telegramId: string) => {
  try {
    const token = await Token.findOne({ telegramId: telegramId });
    return token;
  } catch (err) {
    console.log(err);
  }
}

// get token
// получаю свободный токен, имеющий статус init
// устанавливаю для токена статус pending
// доступ по telegram id

// reset token
// устанавливаю для токена со статусом pending статус init
// доступ по telegram id

// success token
// устанавливаю для токена со статусом pending статус success
// доступ по telegram id

// получить от rdc связку tg_id - token - userId
