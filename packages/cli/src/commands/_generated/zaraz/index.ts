import $config from "./config/index.js";
import $default from "./default/index.js";
import $export from "./export/index.js";
import $history from "./history/index.js";
import $publish from "./publish/index.js";
import $workflow from "./workflow/index.js";
/**
 * zaraz command
 * @generated from apis/overlays/zaraz.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zaraz",
	describe:
		"Server-side tag manager — load third-party tools (analytics, pixels, etc.) from Cloudflare's edge without client-side JS",

	routes: {
		config: $config,
		default: $default,
		export: $export,
		history: $history,
		publish: $publish,
		workflow: $workflow,
	},
});

export default command;
