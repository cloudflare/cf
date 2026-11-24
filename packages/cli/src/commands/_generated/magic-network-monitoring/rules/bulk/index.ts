import $create from "./create.js";
import $update from "./update.js";
/**
 * bulk command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bulk",
	describe: "Operations for rules.bulk",

	routes: {
		create: $create,
		update: $update,
	},
});

export default command;
