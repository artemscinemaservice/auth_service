import { BaseRepository } from '@artemscinemaservice/core/repository';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class AuthRepository extends BaseRepository<PrismaService['account']> {
	public constructor(private readonly prismaService: PrismaService) {
		super(prismaService.account);
	}
}
