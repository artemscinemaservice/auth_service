import {
	Injectable,
	Logger,
	OnModuleDestroy,
	OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/generated/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
	extends PrismaClient
	implements OnModuleInit, OnModuleDestroy
{
	private readonly logger = new Logger(PrismaService.name);

	public constructor() {
		const pool = new Pool({
			connectionString: process.env.POSTGRES_URI ?? '',
		});
		const adapter = new PrismaPg(pool);
		super({ adapter });
	}

	public async onModuleInit() {
		const start = Date.now();
		this.logger.log('Connecting to DB...');

		try {
			await this.$connect();
			const finish = Date.now();
			this.logger.log(`Connected to DB in ${finish - start} ms`);
		} catch (error) {
			this.logger.error('Failed to connect to DB');
			throw error;
		}
	}
	public async onModuleDestroy() {
		await this.$disconnect();
	}
}
