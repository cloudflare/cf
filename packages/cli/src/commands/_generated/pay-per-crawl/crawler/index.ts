import $stripe from "./stripe/index.js";
/**
 * crawler command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "crawler",
	describe: "Operations for crawler",

	routes: {
		stripe: $stripe,
	},
});

export default command;
