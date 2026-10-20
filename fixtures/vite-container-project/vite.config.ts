import { cloudflare } from "@cloudflare/vite-plugin";

export default {
	run: {
		tasks: {
			"task:check:type": {
				command: "node ../../scripts/typecheck.mjs --noEmit",
				dependsOn: [
					{ task: "task:build", from: ["dependencies", "devDependencies"] },
				],
				cache: false,
			},
		},
	},
	plugins: [
		cloudflare({
			inspectorPort: false,
			persistState: false,
			types: { includeRuntime: false },
		}),
	],
};
