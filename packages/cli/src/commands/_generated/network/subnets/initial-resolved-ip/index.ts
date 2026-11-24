import $get from "./get.js";
import $replace from "./replace.js";
/**
 * initial-resolved-ip command group
 * @generated from apis/overlays/network.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "initial-resolved-ip",
	describe: "Operations for subnets.initial-resolved-ip",

	routes: {
		get: $get,
		replace: $replace,
	},
});

export default command;
