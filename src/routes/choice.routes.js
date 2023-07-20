import { Router } from "express";
import validateSchema from "../middlewares/validateSchema.js";
import choiceSchema from "../schemas/choice.schema.js";

const choiceRouter = Router();

choiceRouter.post("/choice", validateSchema(choiceSchema));
choiceRouter.post("/choice/:id/vote");

export default choiceRouter;