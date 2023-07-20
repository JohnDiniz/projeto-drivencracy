import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import choiceSchema from "../schemas/choice.schema.js";
import {createChoice, voteForChoice } from "../controllers/choices.controller.js";

const choiceRouter = Router();

choiceRouter.post("/choice", validateSchema(choiceSchema), createChoice);
choiceRouter.post("/choice/:id/vote" , voteForChoice);

export default choiceRouter;