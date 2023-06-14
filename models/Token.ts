import mongoose from "mongoose";

const TokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    telegramId: {
      type: String,
    },
    userId: {
      type: String,
    },
    status: {
      type: String,
    },
  }
)

export default mongoose.model("Token", TokenSchema);