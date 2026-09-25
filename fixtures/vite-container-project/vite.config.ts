import { cloudflare } from "@cloudflare/vite-plugin";
import { lazyPlugins } from "vite-plus";

export default {
	plugins: lazyPlugins(() => [
		cloudflare({
			inspectorPort: false,
			persistState: false,
			types: { includeRuntime: false },
		}),
	]),
};
