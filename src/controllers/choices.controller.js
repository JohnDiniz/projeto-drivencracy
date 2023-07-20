import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import choiceSchema from "../schemas/choice.schema.js";
import { db } from "../database/database.connection.js";


const handleError = (res, statusCode, errorMessage) => {
  console.error("Erro no servidor:", errorMessage);
  return res.status(statusCode).json({ error: errorMessage });
};

