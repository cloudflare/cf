import baseConfig from "./vite.config.ts";

// Preserve mockable module boundaries in the compiled CLI used by the
// Wrangler compatibility suite. Production builds bundle these dependencies.
export default {
	...baseConfig,
	pack: {
		...baseConfig.pack,
		deps: {
			...baseConfig.pack?.deps,
			neverBundle: [
				"blake3-wasm",
				"miniflare",
				"@clack/prompts",
				"ci-info",
				"execa",
				"undici",
			],
		},
	},
};
