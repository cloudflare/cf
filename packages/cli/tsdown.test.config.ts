import { defineConfig } from "tsdown";
import { cliConfig, runtimeExternals } from "./tsdown.config.ts";

// Preserve mockable module boundaries in the compiled CLI used by the
// Wrangler compatibility suite. The production build intentionally bundles
// these dependencies and remains self-contained.
export default defineConfig({
	...cliConfig,
	deps: {
		...cliConfig.deps,
		neverBundle: [
			...runtimeExternals,
			"@clack/prompts",
			"ci-info",
			"execa",
			"undici",
		],
	},
});
