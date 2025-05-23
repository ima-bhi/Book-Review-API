import { celebrate, Joi } from 'celebrate';

export const bookDef = celebrate({
  body: Joi.object({
    title: Joi.string().required(),
    author: Joi.string().required(),
    genre: Joi.string().required(),
    description: Joi.string().required(),
  }),
});

export const reviewDef = celebrate({
  body: Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().required(),
  }),
});

