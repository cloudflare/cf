import $live from "./live/index.js";
import $overtime from "./over-time/index.js";
/**
 * aggregates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "aggregates",
	describe: "Operations for dex.devices.aggregates",

	routes: {
		live: $live,
		"over-time": $overtime,
	},
});

export default command;
