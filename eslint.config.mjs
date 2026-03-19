// api-gateway/eslint.config.mjs
import coreConfig from '@artemscinemaservice/core/eslint';

export default [
	...coreConfig,

	// local settings
	{
		files: ['**/*.ts'],
		rules: {
			'@typescript-eslint/interface-name-prefix': 'off',
		},
	},

	// ignore config file
	{
		ignores: ['eslint.config.mjs', 'dist', 'node_modules', 'test'],
	},
];
