import $edit from "./edit.js";
import $get from "./get.js";
/**
 * reverse-dns command group
 * @generated from apis/overlays/dns-firewall.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "reverse-dns",
	describe: "Operations for reverse-dns",

	routes: {
		edit: $edit,
		get: $get,
	},
});

export default command;
