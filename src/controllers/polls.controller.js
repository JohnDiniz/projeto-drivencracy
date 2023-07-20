import { db } from "../database/database.connection.js";
import { ObjectId } from "mongodb";
import dayjs from "dayjs";
import pollSchema from "../schemas/poll.schema.js";

const POLLS_COLLECTION = "polls"; // Enquetes
const CHOICES_COLLECTION = "choices"; // Escolhas
const VOTES_COLLECTION = "votes"; //Votos

function handleError(res, error) {
  console.error("Erro no servidor:", error.message);
  return res.status(500).json({ error: "Erro no servidor. Por favor, tente novamente mais tarde." });
}


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

    await db.collection(POLLS_COLLECTION).insertOne(enquete);

    return res.status(201).send(enquete);
  } catch (error) {
    handleError(res, error);
  }
}

export async function getPoll(req, res) {
  try {
      const enquetes = await db.collection(POLLS_COLLECTION).find().toArray();
      return res.status(200).send(enquetes);

  } catch (error) {
    handleError(res, error);
  };
};

export async function getPollIdChoice(req, res) {
  const id = req.params.id;

  try {
      const pollObjectId = new ObjectId(id);
      const pollExisting = await db.collection(POLLS_COLLECTION).findOne({ _id: pollObjectId });

      if (!pollExisting) {
          return res.status(404).send("Enquete inexistente.");
      }

      const choices = await db.collection(CHOICES_COLLECTION).find({ pollId: id }).toArray();

      return res.status(200).json(choices);

  } catch (error) {
    handleError(res, error);
  };
};

// https://www.mongodb.com/docs/manual/reference/method/db.collection.aggregate/#examples

export async function getPollIdResult(req, res) {
  const id = req.params.id;

  try {
    const pollObjectId = new ObjectId(id);
    const pollExisting = await db.collection(POLLS_COLLECTION).findOne({ _id: pollObjectId });
    if (!pollExisting) {
      return res.status(404).send("Enquete inexistente.");
    }

    const choices = await db.collection(CHOICES_COLLECTION).find({ pollId: id }).toArray();

    let mostVoted = null;
    let numberMosted = 0;

    for (const choice of choices) {
      const choiceId = choice._id;
      console.log('choiceid', choiceId);

      const aggregationResult = await db
        .collection(VOTES_COLLECTION)
        .aggregate([
          { $match: { choiceId } },
          { $group: { _id: "$choiceId", votes: { $sum: 1 } } },
        ])
        .toArray();

        console.log(aggregationResult);

      if (aggregationResult.length > 0 && aggregationResult[0].votes > numberMosted) {
        mostVoted = choice;
        numberMosted = aggregationResult[0].votes;
      }
    }

    if (!mostVoted) {
      return res.status(200).json({
        _id: pollExisting._id,
        title: pollExisting.title,
        expireAt: pollExisting.expireAt,
        result: "Nenhuma opção de voto com votos encontrada.",
      });
    }

    const resultado = {
      _id: pollExisting._id,
      title: pollExisting.title,
      expireAt: pollExisting.expireAt,
      result: {
        title: mostVoted.title,
        votes: numberMosted,
      },
    };

    return res.status(200).json(resultado);
  } catch (error) {
    handleError(res, error);
  };
}
