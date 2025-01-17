import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  TURSO_AUTH_TOKEN: string;
  TURSO_DATABASE_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    TURSO_AUTH_TOKEN: joi.string().required(),
    TURSO_DATABASE_URL: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  tursoAuthToken: envVars.TURSO_AUTH_TOKEN,
  tursoDatabaseUrl: envVars.TURSO_DATABASE_URL,
};
