import { registerAs } from '@nestjs/config';

import { validateEnv } from '@/shared';

import { DbConfig } from '../interfaces';
import { DbValidator } from '../validators';

export const dbEnv = registerAs<DbConfig>('db', () => {
	validateEnv({ config: process.env, envVariablesClass: DbValidator });
	return {
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT ?? ''),
		user: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_DATABASE,
		uri: process.env.DB_URI,
	};
});
