import type { SendOtpRequest } from '@artemscinemaservice/contracts/gen/auth';
import { BadRequestException } from '@nestjs/common';

import type { OtpService } from '../otp/otp.service';

import type { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';

jest.mock('../otp/otp.service', () => ({
	OtpService: class OtpService {},
}));

jest.mock('./auth.repository', () => ({
	AuthRepository: class AuthRepository {},
}));

describe('AuthService', () => {
	const buildService = () => {
		const authRepository = {
			findUnique: jest.fn(),
			create: jest.fn(),
		} as unknown as jest.Mocked<AuthRepository>;

		const otpService = {
			sendCode: jest.fn(),
		} as unknown as jest.Mocked<OtpService>;

		return {
			authRepository,
			otpService,
			service: new AuthService(authRepository, otpService),
		};
	};

	it('creates a phone-based account before sending OTP', async () => {
		const { service, authRepository, otpService } = buildService();
		const request: SendOtpRequest = {
			identifier: '+48123456789',
			type: 'phone',
		};

		authRepository.findUnique.mockResolvedValueOnce(null);
		authRepository.create.mockResolvedValueOnce({
			id: 'account-id',
			email: null,
			phoneNumber: request.identifier,
			password: 'otp-pending-password',
			isEmailVerified: false,
			isPhoneVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		otpService.sendCode.mockResolvedValueOnce({ hash: 'otp-hash' });

		const result = await service.sendOtp(request);

		expect(authRepository.create).toHaveBeenCalledWith({
			data: {
				email: null,
				phoneNumber: request.identifier,
				password: 'otp-pending-password',
			},
		});
		expect(otpService.sendCode).toHaveBeenCalledWith({
			identifier: request.identifier,
			type: 'phone',
		});
		expect(result).toEqual({ success: true });
	});

	it('creates an email-based account before sending OTP', async () => {
		const { service, authRepository, otpService } = buildService();
		const request: SendOtpRequest = {
			identifier: 'user@example.com',
			type: 'email',
		};

		authRepository.findUnique.mockResolvedValueOnce(null);
		authRepository.create.mockResolvedValueOnce({
			id: 'account-id',
			email: request.identifier,
			phoneNumber: null,
			password: 'otp-pending-password',
			isEmailVerified: false,
			isPhoneVerified: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		otpService.sendCode.mockResolvedValueOnce({ hash: 'otp-hash' });

		const result = await service.sendOtp(request);

		expect(authRepository.create).toHaveBeenCalledWith({
			data: {
				email: request.identifier,
				phoneNumber: null,
				password: 'otp-pending-password',
			},
		});
		expect(otpService.sendCode).toHaveBeenCalledWith({
			identifier: request.identifier,
			type: 'email',
		});
		expect(result).toEqual({ success: true });
	});

	it('rejects blank identifiers', async () => {
		const { service } = buildService();
		const request: SendOtpRequest = {
			identifier: '   ',
			type: 'email',
		};

		await expect(service.sendOtp(request)).rejects.toBeInstanceOf(
			BadRequestException
		);
	});
});
