import $stripe from "./stripe/index.js";
/**
 * publisher command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "publisher",
	describe: "Operations for publisher",

	routes: {
		stripe: $stripe,
	},
});

export default command;
