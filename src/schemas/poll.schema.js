import Joi from "joi";

const pollSchema = Joi.object({
  title: Joi.string().required(),
  expireAt: Joi.date().optional(), 
});

export default pollSchema;
