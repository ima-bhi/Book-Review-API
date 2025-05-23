import { celebrate, Joi } from 'celebrate';

export const registerDef = celebrate({
  body: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
});

export const loginDef = celebrate({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
});

export const resetPassword = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required(),
    newPassword: Joi.string().required(),
  }),
});
