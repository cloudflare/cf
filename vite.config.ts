import cloudflare from "@cloudflare/oxlint-config/vite-plus";
import { defineConfig } from "vite-plus";

export default defineConfig({
	run: {
		// Restore task ordering first; enable caching once inputs and outputs are audited.
		cache: false,
		tasks: {
			"repo:types": {
				command: "vp run -r task:check:type",
				cache: false,
			},
			"repo:check": {
				command: "vp check",
				dependsOn: ["repo:types"],
				cache: false,
			},
			"repo:lint": {
				command: "vp lint --deny-warnings --type-aware",
				dependsOn: ["cf#task:generate"],
				cache: false,
			},
			"repo:format": {
				command: "vp fmt --check",
				cache: false,
			},
		},
	},
	fmt: {
		printWidth: 80,
		singleQuote: false,
		semi: true,
		useTabs: true,
		trailingComma: "es5",
		sortImports: {
			groups: ["builtin", "external", "parent", "sibling", "index", "type"],
			newlinesBetween: false,
		},
		sortPackageJson: {},
		ignorePatterns: [
			// Changesets owns this prerelease state file and writes its own JSON style.
			".changeset/pre.json",
			// Keep product fixtures in their own upstream Vite format.
			"fixtures/**",
		],
	},
	lint: {
		extends: [cloudflare],
		env: cloudflare.env,
		categories: {
			correctness: "error",
		},
		options: {
			typeAware: true,
			typeCheck: false,
			denyWarnings: true,
			// Temporarily off until the adoption commits settle which rules are on.
			reportUnusedDisableDirectives: "off",
		},
		rules: {
			"typescript/no-explicit-any": "error",
			"typescript/no-non-null-assertion": "error",
			"typescript/consistent-type-imports": "error",
			"no-shadow": [
				"error",
				{
					allow: ["expect"],
				},
			],
			"no-unused-vars": [
				"error",
				{
					argsIgnorePattern: "^_",
					varsIgnorePattern: "^_",
					ignoreRestSiblings: true,
					fix: {
						imports: "fix",
					},
				},
			],
			curly: ["error", "all"],
			"vite-plus/prefer-vite-plus-imports": "error",
			// The CLI writes to the console directly and has no logger abstraction.
			// See docs/design-history.md.
			"no-console": "off",
			// Tests assert through node:assert and local expect* helpers.
			"vitest/expect-expect": [
				"error",
				{ assertFunctionNames: ["assert*", "expect*"] },
			],
			// Parameterized suites name describe blocks from loop variables.
			"vitest/valid-title": ["error", { ignoreTypeOfDescribeName: true }],
			// Temporarily off while adopting @cloudflare/oxlint-config. Each rule is
			// enabled with its fixes, or documented as staying off, in its own commit.
			"@nkzw/no-instanceof": "off",
			"import/consistent-type-specifier-style": "off",
			"import/export": "off",
			"import/no-namespace": "off",
			"no-promise-executor-return": "off",
			"no-useless-assignment": "off",
			"object-shorthand": "off",
			"preserve-caught-error": "off",
			"quality/no-array-filter-map": "off",
			"quality/no-chained-type-assertions": "off",
			"quality/no-conditional-empty-object-spread": "off",
			"quality/no-known-value-widening": "off",
			"quality/no-object-parameters": "off",
			"quality/no-reflect-get": "off",
			"quality/no-unknown-returns": "off",
			"quality/no-unknown-type-aliases": "off",
			"quality/no-unsafe-dictionary-type": "off",
			"typescript/array-type": "off",
			"typescript/no-empty-object-type": "off",
			"typescript/no-misused-promises": "off",
			"typescript/no-unnecessary-type-assertion": "off",
			"typescript/no-unsafe-argument": "off",
			"typescript/no-unsafe-assignment": "off",
			"typescript/no-unsafe-call": "off",
			"typescript/no-unsafe-member-access": "off",
			"typescript/no-unsafe-return": "off",
			"typescript/no-unsafe-type-assertion": "off",
			"typescript/use-unknown-in-catch-callback-variable": "off",
			"unicorn/catch-error-name": "off",
			"unicorn/consistent-function-scoping": "off",
			"unicorn/no-hex-escape": "off",
			"unicorn/no-typeof-undefined": "off",
			"unicorn/numeric-separators-style": "off",
			"unicorn/prefer-at": "off",
			"unicorn/prefer-import-meta-properties": "off",
			"unicorn/prefer-number-properties": "off",
			"unicorn/prefer-set-has": "off",
			"unicorn/prefer-single-call": "off",
			"unicorn/prefer-string-raw": "off",
			"unicorn/prefer-string-replace-all": "off",
			"unicorn/prefer-top-level-await": "off",
			"unicorn/text-encoding-identifier-case": "off",
			"vitest/no-conditional-expect": "off",
			"vitest/no-standalone-expect": "off",
			"vitest/require-mock-type-parameters": "off",
			"vitest/require-to-throw-message": "off",
			"vitest/valid-expect": "off",
		},
		overrides: [
			{
				// Wrangler compatibility tests keep upstream titles, and their skip and
				// todo cases are parity classifications with placeholder bodies. See
				// packages/wrangler-tests/AGENTS.md.
				files: ["packages/wrangler-tests/**"],
				rules: {
					"vitest/expect-expect": "off",
					"vitest/no-conditional-tests": "off",
					"vitest/no-disabled-tests": "off",
					"vitest/valid-describe-callback": "off",
					"vitest/valid-title": "off",
					"vitest/warn-todo": "off",
				},
			},
			{
				// Upstream CommonJS script for Node.js versions older than cf supports.
				files: [
					"packages/wrangler-tests/src/__tests__/test-old-node-version.js",
				],
				rules: {
					"typescript/no-require-imports": "off",
					"unicorn/prefer-node-protocol": "off",
				},
			},
		],
		ignorePatterns: [
			...cloudflare.ignorePatterns,
			"fixtures/**",
			"packages/cli/generator/**",
			"packages/cli/src/commands/_generated/**",
			"packages/cli/src/lib/completions/**",
		],
		jsPlugins: [
			{
				name: "vite-plus",
				specifier: "vite-plus/oxlint-plugin",
			},
		],
	},
});
