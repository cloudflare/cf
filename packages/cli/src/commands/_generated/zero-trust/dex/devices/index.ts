import $aggregates from "./aggregates/index.js";
import $get from "./get.js";
import $list from "./list.js";
import $overtime from "./over-time/index.js";
/**
 * devices command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "devices",
	describe: "Operations for dex.devices",

	routes: {
		get: $get,
		list: $list,
		aggregates: $aggregates,
		"over-time": $overtime,
	},
});

export default command;
