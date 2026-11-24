import $create from "./create.js";
import $delete from "./delete.js";
import $dns from "./dns/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $preview from "./preview.js";
import $reputation from "./reputation/index.js";
import $update from "./update.js";
/**
 * subdomains command group
 * @generated from apis/overlays/email-sending.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "subdomains",
	describe: "Configure sending subdomains and keep their DNS records healthy",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		preview: $preview,
		update: $update,
		dns: $dns,
		reputation: $reputation,
	},
});

export default command;
