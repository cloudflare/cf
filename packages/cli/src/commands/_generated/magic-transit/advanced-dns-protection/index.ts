import $configs from "./configs/index.js";
/**
 * advanced-dns-protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "advanced-dns-protection",
	describe: "Advanced Dns Protection operations",

	routes: {
		configs: $configs,
	},
});

export default command;
