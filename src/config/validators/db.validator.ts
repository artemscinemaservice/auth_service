import { IsInt, IsString, Max, Min } from 'class-validator';

export class DbValidator {
	@IsString()
	public DB_USER: string;

	@IsString()
	public DB_PASSWORD: string;

	@IsString()
	public DB_HOST: string;

	@IsInt()
	@Min(1)
	@Max(65535)
	public DB_PORT: number;

	@IsString()
	public DB_DATABASE: string;

	@IsString()
	public DB_URI: string;
}
