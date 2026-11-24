import $config from "./config/index.js";
/**
 * google-tag-gateway command
 * @generated from apis/overlays/google-tag-gateway.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "google-tag-gateway",
	describe: "Google Tag Gateway operations",

	routes: {
		config: $config,
	},
});

export default command;
