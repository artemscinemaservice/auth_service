import {
	VerifyOtpRequest,
	VerifyOtpResponse,
} from '@artemscinemaservice/contracts/gen/auth';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { createHash, randomUUID } from 'crypto';

import { RedisService } from '@/infrastructure/redis/redis.service';

@Injectable()
export class OtpService {
	public constructor(private readonly redisService: RedisService) {}

	generateCode(): {
		hash: string;
		code: string;
	} {
		const code = randomUUID().slice(0, 8).toUpperCase();
		const hash = createHash('sha256').update(code).digest('hex');
		return { hash, code };
	}

	public async generateOtp({
		type,
		identifier,
	}: {
		identifier: string;
		type: 'phone' | 'email';
	}) {
		const { hash, code } = this.generateCode();
		console.debug(`Generated OTP code for ${type}:${identifier}:${code}`);
		await this.redisService.set(
			`otp:${type}:${identifier}`,
			hash,
			'EX',
			5 * 60
		); // 5 minutes expiration
		return { hash, code };
	}

	public async verifyOtp({
		type,
		identifier,
		code,
	}: VerifyOtpRequest): Promise<boolean> {
		const storedHash = await this.redisService.get(
			`otp:${type}:${identifier}`
		);

		if (!storedHash) {
			throw new RpcException('Invalid or expired code');
		}

		const hash = createHash('sha256').update(code).digest('hex');

		if (storedHash !== hash) {
			throw new RpcException('Invalid code');
		}
		await this.redisService.del(`otp:${type}:${identifier}`);
		return true;
	}
}
