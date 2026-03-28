import {
	Injectable,
	Logger,
	type OnModuleDestroy,
	type OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService
	extends Redis
	implements OnModuleInit, OnModuleDestroy
{
	public constructor(private readonly configService: ConfigService) {
		super({
			host: configService.getOrThrow<string>('REDIS_HOST'),
			port: configService.getOrThrow<number>('REDIS_PORT'),
			password: configService.get<string | undefined>('REDIS_PASSWORD'),
			maxRetriesPerRequest: 5,
			enableOfflineQueue: true,
		});
	}

	private readonly logger = new Logger(RedisService.name);
	public onModuleInit() {
		const start = Date.now();
		this.logger.log('Initialize redis...');

		this.on('connect', () => this.logger.log('Connecting to redis...'));
		this.on('ready', () =>
			this.logger.log(
				`Redis is ready! Initialization took ${Date.now() - start}ms`
			)
		);
		this.on('error', error =>
			this.logger.error(`Error while connecting to redis: ${error}`)
		);

		this.on('close', () => this.logger.warn('Connection to redis closed!'));

		this.on('reconnecting', () =>
			this.logger.warn('Reconnecting to redis...')
		);
	}
	public async onModuleDestroy() {
		await this.quit();
	}
}
