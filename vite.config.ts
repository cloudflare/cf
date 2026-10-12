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
			// Recorded API-fixture responses; reformatting them creates noise on every re-record.
			"packages/cli/e2e/**/*.json",
			// Fern-generated SDK source is committed verbatim.
			"packages/cli/src/sdk/sdk/**",
		],
	},
	lint: {
		plugins: ["typescript", "import", "unicorn"],
		categories: {
			correctness: "error",
		},
		options: {
			typeAware: true,
			typeCheck: false,
			denyWarnings: true,
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
		},
		ignorePatterns: [
			"fixtures/**",
			"packages/cli/generator/**",
			"packages/cli/src/commands/_generated/**",
			"packages/cli/src/sdk/sdk/**",
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
