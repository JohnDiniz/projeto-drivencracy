import { Router } from "express";
import choiceRouter from "./choice.routes.js";
import pollRouter from "./poll.routes.js";

const router = Router();

router.use(choiceRouter);
router.use(pollRouter);

export default router;