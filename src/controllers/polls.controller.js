import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import pollSchema from "../schemas/poll.schema.js";


const handleError = (res, statusCode, errorMessage) => {
  console.error("Erro no servidor:", errorMessage);
  return res.status(statusCode).json({ error: errorMessage });
};


export async function postPoll(req, res) {
  const { title, expireAt } = req.body;
  try {
    const validation = pollSchema.validate({ title }, { abortEarly: false });

    if (validation.error) {
      const errors = validation.error.details.map((detail) => detail.message);
      return res.status(422).send(errors);
    }

    const expireAtValue = expireAt || dayjs().add(30, "day").format("YYYY-MM-DD HH:mm");
    const enquete = { title, expireAt: expireAtValue };

    await db.collection("Enquetes").insertOne(enquete);

    return res.status(201).send(enquete);
  } catch (error) {
    handleError(res, 500, "Erro no servidor. Por favor, tente novamente mais tarde.");
  }
}

export async function getPoll(req, res) {
  try {
      const enquetes = await db.collection("Enquetes").find().toArray();
      return res.status(200).send(enquetes);

  } catch (error) {
    handleError(res, 500, "Erro no servidor. Por favor, tente novamente mais tarde.");
  };
};