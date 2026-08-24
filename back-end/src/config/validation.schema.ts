/*
import * as Joi from 'joi';

// Le conteneur refuse de démarrer si une variable requise manque ou est invalide.
// A completer au fur et à mesure des besoins (DB, JWT, OAuth, etc.)
export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DB_HOST: Joi.string().default('localhost'),
  DB_PORT: Joi.number().default(5432),
  DB_USERNAME: Joi.string().default('postgres'),
  DB_PASSWORD: Joi.string().default('postgres'),
  DB_NAME: Joi.string().default('transcendence'),

  JWT_SECRET: Joi.string().optional(), // .required() quand le module auth sera actif
  JWT_EXPIRES_IN: Joi.string().default('1d'),
});
*/
