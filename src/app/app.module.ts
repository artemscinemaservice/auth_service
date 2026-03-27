import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
	imports: [
		AuthModule,
		PrismaModule,
		ConfigModule.forRoot({ isGlobal: true }),
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
