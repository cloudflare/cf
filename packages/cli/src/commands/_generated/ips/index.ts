import $list from "./list.js";
/**
 * ips command
 * @generated from apis/overlays/ips.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "ips",
	describe: "ips",

	routes: {
		list: $list,
	},
});

export default command;
