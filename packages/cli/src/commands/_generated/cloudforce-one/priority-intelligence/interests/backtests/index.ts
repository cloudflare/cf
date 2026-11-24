import $create from "./create.js";
import $get from "./get.js";
/**
 * backtests command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "backtests",
	describe: "Operations for priority-intelligence.interests.backtests",

	routes: {
		create: $create,
		get: $get,
	},
});

export default command;
