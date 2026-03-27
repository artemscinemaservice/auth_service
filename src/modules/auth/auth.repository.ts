import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';
import { AccountCreateInput } from '@prisma/generated/models';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

@Injectable()
export class AuthRepository {
	public constructor(private readonly prismaService: PrismaService) {}

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

	public async createAccount(data: AccountCreateInput) {
		return await this.prismaService.account.create({ data });
	}
}
