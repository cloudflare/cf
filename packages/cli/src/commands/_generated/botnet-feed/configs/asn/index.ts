import $delete from "./delete.js";
import $get from "./get.js";
/**
 * asn command group
 * @generated from apis/overlays/botnet-feed.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "asn",
	describe: "Operations for configs.asn",

	routes: {
		delete: $delete,
		get: $get,
	},
});

export default command;
