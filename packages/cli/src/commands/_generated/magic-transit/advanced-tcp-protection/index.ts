import $configs from "./configs/index.js";
/**
 * advanced-tcp-protection command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "advanced-tcp-protection",
	describe: "Advanced Tcp Protection operations",

	routes: {
		configs: $configs,
	},
});

export default command;
