import $delete from "./delete.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $zsks from "./zsks/index.js";
/**
 * dnssec command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dnssec",
	describe: "Operations for dnssec",

	routes: {
		delete: $delete,
		edit: $edit,
		get: $get,
		zsks: $zsks,
	},
});

export default command;
