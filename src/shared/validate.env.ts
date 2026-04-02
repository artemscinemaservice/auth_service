import { Logger } from '@nestjs/common';
import { ClassConstructor, plainToClass } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';

const logger = new Logger('ValidateEnv');

export function validateEnv<T extends Record<string, any>>({
	config,
	envVariablesClass,
}: {
	config: Record<string, string | undefined>;
	envVariablesClass: ClassConstructor<T>;
}) {
	const validatedConfig = plainToClass(envVariablesClass, config, {
		enableImplicitConversion: true,
	});

	const errors: ValidationError[] = validateSync(validatedConfig, {
		skipMissingProperties: false,
	});

	if (errors.length > 0) {
		const errorMsg = errors
			.map(
				error =>
					`\nError in ${error.property}:\n` +
					Object.entries(error.constraints ?? {})
						.map(([key, value]) => `+ ${key}: ${value}`)
						.join('\n')
			)
			.join('\n');

		logger.error('Environment validation failed');
		logger.error(errorMsg);

		throw new Error(errorMsg);
	}

	return validatedConfig;
}
