import $list from "./list.js";
/**
 * zsks command group
 * @generated from apis/overlays/dns.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zsks",
	describe: "Operations for dnssec.zsks",

	routes: {
		list: $list,
	},
});

export default command;
