import { cloudflare } from "@cloudflare/vite-plugin";

export default {
	plugins: [
		cloudflare({
			inspectorPort: false,
			persistState: false,
			types: { includeRuntime: false },
		}),
	],
};
