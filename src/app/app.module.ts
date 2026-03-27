import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/prisma/prisma.module';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
	imports: [AuthModule, PrismaModule],
	controllers: [],
	providers: [],
})
export class AppModule {}
