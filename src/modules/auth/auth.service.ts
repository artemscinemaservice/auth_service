import type {
	SendOtpRequest,
	SendOtpResponse,
} from '@artemscinemaservice/contracts/gen/auth';
import { Injectable } from '@nestjs/common';
import { Account } from '@prisma/generated/client';

import { AuthRepository } from './auth.repository';

@Injectable()
export class AuthService {
	public constructor(private readonly authRepository: AuthRepository) {}
	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data;
		try {
			const account: Account | null =
				type === 'PHONE_NUMBER'
					? await this.authRepository.findAccountByPhoneNumber(
							identifier
						)
					: await this.authRepository.findAccountByEmail(identifier);
			if (!account) {
				return { success: false };
			}
			return { success: true };
		} catch (error) {
			// return { success: false };
			throw error;
		}
	}
}
