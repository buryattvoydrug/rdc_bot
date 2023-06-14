import express from "express";
import { successToken } from "../utils/token";

const router = express.Router();

// получить от rdc связку tg_id - token - userId
// поместить userId  в БД
router.put("/activate_token", async (req, res) => {
    try {
      const token = await successToken(req.body.telegramId, req.body.userId)
      if (token) {
        res.status(200).json("Token has been activated!");
      }
      else {
        return res.status(400).json("Token not found!");
      }
    } catch (err) {
      return res.status(500).json(err);
    }
});

export default router;