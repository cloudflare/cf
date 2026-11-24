import $edit from "./edit.js";
import $get from "./get.js";
/**
 * cloudflare-source command group
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cloudflare-source",
	describe: "Operations for subnets.cloudflare-source",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
