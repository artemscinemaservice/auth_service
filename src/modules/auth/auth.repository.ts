import { BaseRepository } from '@artemscinemaservice/core/repository';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class AuthRepository extends BaseRepository<PrismaService['account']> {
	public constructor(private readonly prismaService: PrismaService) {
		super(prismaService.account);
	}

	public async findAccountByPhoneNumber(
		phoneNumber: string
	): Promise<Account | null> {
		return await this.prismaService.account.findUnique({
			where: { phoneNumber },
		});
	}

	public async findAccountByEmail(email: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({
			where: { email },
		});
	}
}
