import { DbConfig } from './db.interface';
import { GrpcConfig } from './grpc.interface';
import { RedisConfig } from './redis.interface';

export interface AllConfigs {
	grpc: GrpcConfig;
	db: DbConfig;
	redis: RedisConfig;
}
