import type {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse,
} from '@artemscinemaservice/contracts/gen/auth';
import { RpcStatus } from '@artemscinemaservice/core/enums';
import { BadRequestException, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
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
			let account = await this.findAccount({ identifier, type });

			if (!account) {
				account = await this.authRepository.create({
					data: this.buildAccountCreateData(
						identifier,
						normalizedType
					),
				});
			}

			const hash = await this.otpService.generateOtp({
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

	public async verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		const account = await this.findAccount(data);
		if (!account)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found',
			});

		const isCodeValid = await this.otpService.verifyOtp(data);

		if (!isCodeValid) {
			throw new RpcException({
				details: 'Invalid code',
				code: RpcStatus.NOT_FOUND,
			});
		}

		if (data.type === 'phone' && !account.isPhoneVerified) {
			this.authRepository.update({
				where: { id: account.id },
				data: { isPhoneVerified: true },
			});
		}
		if (data.type === 'email' && !account.isEmailVerified) {
			this.authRepository.update({
				where: { id: account.id },
				data: { isEmailVerified: true },
			});
		}

		return {
			accessToken: 'mockAccess',
			refreshToken: 'mockRefresh',
		};
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

	private async findAccount({
		identifier,
		type,
	}: {
		identifier: string;
		type: string;
	}): Promise<Account | null> {
		const normalizedType = this.normalizeIdentifierType(type);
		return await this.authRepository.findUnique({
			where:
				normalizedType === 'phone'
					? { phoneNumber: identifier }
					: { email: identifier },
		});
	}
}
