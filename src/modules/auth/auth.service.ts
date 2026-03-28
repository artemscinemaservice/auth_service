import type {
	SendOtpRequest,
	SendOtpResponse,
} from '@artemscinemaservice/contracts/gen/auth';
import { BadRequestException, Injectable } from '@nestjs/common';
import type { Account, Prisma } from '@prisma/generated/client';

import { OtpService } from '../otp/otp.service';

import { AuthRepository } from './auth.repository';

const OTP_PLACEHOLDER_PASSWORD = 'otp-pending-password';
type IdentifierType = 'phone' | 'email';

@Injectable()
export class AuthService {
	public constructor(
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService
	) {}
	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data;
		try {
			const normalizedType = this.normalizeIdentifierType(type);
			let account: Account | null = await this.authRepository.findUnique({
				where:
					normalizedType === 'phone'
						? { phoneNumber: identifier }
						: { email: identifier },
			});

			if (!account) {
				account = await this.authRepository.create({
					data: this.buildAccountCreateData(
						identifier,
						normalizedType
					),
				});
			}

			const hash = await this.otpService.sendCode({
				identifier,
				type: normalizedType,
			});

			console.debug('CODE', hash);

			return { success: true };
		} catch (error) {
			// return { success: false };
			throw error;
		}
	}

	private buildAccountCreateData(
		identifier: string,
		type: IdentifierType
	): Prisma.AccountCreateInput {
		if (!identifier.trim()) {
			throw new BadRequestException('Identifier is required');
		}

		if (type === 'phone') {
			return {
				email: null,
				phoneNumber: identifier,
				password: OTP_PLACEHOLDER_PASSWORD,
			};
		}

		if (type === 'email') {
			return {
				email: identifier,
				phoneNumber: null,
				password: OTP_PLACEHOLDER_PASSWORD,
			};
		}

		throw new BadRequestException('Unsupported identifier type');
	}

	private normalizeIdentifierType(
		type: SendOtpRequest['type']
	): IdentifierType {
		if (type === 'phone' || type === 'PHONE_NUMBER') {
			return 'phone';
		}

		if (type === 'email' || type === 'EMAIL') {
			return 'email';
		}

		throw new BadRequestException('Unsupported identifier type');
	}
}
