import dayjs from "dayjs";
import { ObjectId } from "mongodb";
import choiceSchema from "../schemas/choice.schema.js";
import { db } from "../database/database.connection.js";

const POLLS_COLLECTION = "polls"; // Enquetes
const CHOICES_COLLECTION = "choices"; // Escolhas
const VOTES_COLLECTION = "votes"; //Votos

function handleError(res, error) {
  console.error("Erro no servidor:", error.message);
  return res.status(500).json({ error: "Erro no servidor. Por favor, tente novamente mais tarde." });
}

async function documentExists(collection, filter) {
  return await db.collection(collection).findOne(filter);
}

export async function createChoice(req, res) {
  const { title, pollId } = req.body;
  try {
    const validation = choiceSchema.validate({ title, pollId }, { abortEarly: false });

    if (validation.error) {
      const errors = validation.error.details.map(detail => detail.message);
      return res.status(422).json({ errors });
    }

    const pollObjectId = new ObjectId(pollId);

    const enqueteExistente = await documentExists(POLLS_COLLECTION, { _id: pollObjectId });
    
    if (!enqueteExistente) {
      return res.status(404).json({ error: "Enquete inexistente." });
    }

    const titleExistente = await documentExists(CHOICES_COLLECTION, { title });
    if (titleExistente) {
      return res.status(409).json({ error: "O título já está sendo utilizado." });
    }

    const expirou = dayjs().isAfter(enqueteExistente.expireAt, "minute");
    if (expirou) {
      return res.status(403).json({ error: "A enquete já expirou." });
    }

    const choice = { title, pollId };
    await db.collection(CHOICES_COLLECTION).insertOne(choice);

    res.status(201).json(choice);

  } catch (error) {
    handleError(res, error);
  }
}

export async function voteForChoice(req, res) {
  const id = req.params.id;

  try {
    const choiceObjectId = new ObjectId(id);
    const escolhaExistente = await documentExists(CHOICES_COLLECTION, { _id: choiceObjectId });

    if (!escolhaExistente) {
      return res.status(404).json({ error: "Escolha inexistente." });
    }

    const pollObjectId = new ObjectId(escolhaExistente.pollId)
    const enqueteExistente = await documentExists(POLLS_COLLECTION, { _id: pollObjectId });

    const expirou = dayjs().isAfter(enqueteExistente.expireAt, "minute");
    if (expirou) {
      return res.status(403).json({ error: "A enquete já expirou." });
    }

    const voto = {
      createdAt: dayjs().format("YYYY-MM-DD HH:mm"),
      choiceId: new ObjectId(id)
    }

    await db.collection(VOTES_COLLECTION).insertOne(voto);

    return res.sendStatus(201);

  } catch (error) {
    handleError(res, error);
  }
}