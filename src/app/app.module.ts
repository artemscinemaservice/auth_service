import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';

import { dbEnv, grpcEnv, redisEnv } from '@/config';
import { RedisModule } from '@/infrastructure/redis/redis.module';

@Module({
	imports: [
		AuthModule,
		PrismaModule,
		ConfigModule.forRoot({
			isGlobal: true,
			load: [grpcEnv, dbEnv, redisEnv],
		}),
		RedisModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
