import { registerAs } from '@nestjs/config';

import { validateEnv } from '@/shared';

import { RedisConfig } from '../interfaces';
import { RedisValidator } from '../validators';

export const redisEnv = registerAs<RedisConfig>('redis', () => {
	validateEnv({ config: process.env, envVariablesClass: RedisValidator });

	return {
		host: process.env.REDIS_HOST,
		port: parseInt(process.env.REDIS_PORT ?? ''),
		password: process.env.REDIS_PASSWORD,
	};
});
