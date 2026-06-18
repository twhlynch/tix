import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig([
	js.configs.recommended,
	...tseslint.configs.strictTypeChecked,
	{
		rules: {
			// handled by TS
			'@typescript-eslint/no-unused-vars': 'off',
			// more sensible defaults
			'@typescript-eslint/restrict-template-expressions': [
				'error',
				{ allowNumber: true, allowBoolean: true },
			],
			// unnecessary
			'@typescript-eslint/no-misused-spread': 'off',
		},
	},
	{
		languageOptions: {
			parserOptions: {
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		ignores: ['node_modules', 'dist', 'cmd', '.wrangler'],
	},
]);
