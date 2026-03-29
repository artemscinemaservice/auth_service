import type {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest,
	VerifyOtpResponse,
} from '@artemscinemaservice/contracts/gen/auth';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { AuthService } from './auth.service';

@Controller()
export class AuthController {
	public constructor(private readonly authService: AuthService) {}

	@GrpcMethod('AuthService', 'SendOtp')
	public sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		return this.authService.sendOtp(data);
	}

	@GrpcMethod('AuthService', 'VerifyOtp')
	public verifyOtp(data: VerifyOtpRequest): Promise<VerifyOtpResponse> {
		return this.authService.verifyOtp(data);
	}
}
