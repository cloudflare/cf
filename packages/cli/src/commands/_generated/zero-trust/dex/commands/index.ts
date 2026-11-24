import $create from "./create.js";
import $eligibledevices from "./eligible-devices/index.js";
import $list from "./list.js";
import $quota from "./quota/index.js";
import $results from "./results/index.js";
/**
 * commands command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "commands",
	describe: "Operations for dex.commands",

	routes: {
		create: $create,
		list: $list,
		"eligible-devices": $eligibledevices,
		quota: $quota,
		results: $results,
	},
});

export default command;
