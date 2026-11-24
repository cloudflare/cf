import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * cnis command group
 * @generated from apis/overlays/network-interconnects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "cnis",
	describe:
		"Cloud Network Interconnect (CNI) connections — private links from cloud providers to Cloudflare",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
		list: $list,
		update: $update,
	},
});

export default command;
