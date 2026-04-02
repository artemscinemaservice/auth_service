import { registerAs } from '@nestjs/config';

import { validateEnv } from '@/shared';

import type { GrpcConfig } from '../interfaces';
import { GrpcValidator } from '../validators';

export const grpcEnv = registerAs<GrpcConfig>('grpc', () => {
	validateEnv({ config: process.env, envVariablesClass: GrpcValidator });
	return {
		host: process.env.GRPC_HOST,
		port: parseInt(process.env.GRPC_PORT ?? ''),
	};
});
