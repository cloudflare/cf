import $list from "./list.js";
/**
 * dns-destination-ips command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dns-destination-ips",
	describe: "Operations for gateway.dns-destination-ips",

	routes: {
		list: $list,
	},
});

export default command;
