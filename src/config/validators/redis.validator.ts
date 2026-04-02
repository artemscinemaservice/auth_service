import { IsInt, IsString } from 'class-validator';

export class RedisValidator {
	@IsString()
	public REDIS_PASSWORD: string;

	@IsString()
	public REDIS_HOST: string;

	@IsInt()
	public REDIS_PORT: number;
}
