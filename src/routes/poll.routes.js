import { Router } from "express";
import pollSchema from "../schemas/poll.schema.js"
import schemaValidation from "../middlewares/validateSchema.js";
import { postPoll } from "../controllers/polls.controller.js";
import { getPoll } from "../controllers/polls.controller.js";


const pollRouter = Router();

pollRouter.post("/poll", schemaValidation(pollSchema), postPoll);
pollRouter.get("/poll", getPoll);

export default pollRouter;
