import $create from "./create.js";
/**
 * quota command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "quota",
	describe: "Operations for priority-intelligence.quota",

	routes: {
		create: $create,
	},
});

export default command;
