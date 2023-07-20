import { Router } from "express";
import pollSchema from "../schemas/poll.schema.js"
import schemaValidation from "../middlewares/validateSchema.js";
import { postPoll, getPoll, getPollIdChoice, getPollIdResult } from "../controllers/polls.controller.js";

const pollRouter = Router();

pollRouter.post("/poll", schemaValidation(pollSchema), postPoll);
pollRouter.get("/poll", getPoll);
pollRouter.get("/poll/:id/choice", getPollIdChoice);
pollRouter.get("/poll/:id/result", getPollIdResult);


export default pollRouter;
