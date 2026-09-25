import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, lazyPlugins } from "vite-plus";

export default defineConfig({
	plugins: lazyPlugins(() => [
		cloudflare({
			inspectorPort: false,
			persistState: false,
			types: { includeRuntime: false },
		}),
	]),
});
