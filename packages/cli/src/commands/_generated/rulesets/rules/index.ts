import $create from "./create.js";
import $delete from "./delete.js";
import $update from "./update.js";
/**
 * rules command group
 * @generated from apis/overlays/rulesets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "rules",
	describe:
		"Individual rules within a ruleset — each with an expression, action, and priority",

	routes: {
		create: $create,
		delete: $delete,
		update: $update,
	},
});

export default command;
