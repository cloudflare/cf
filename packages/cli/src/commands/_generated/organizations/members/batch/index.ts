import $create from "./create.js";
/**
 * batch command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "batch",
	describe: "Add members to an organization in bulk",

	routes: {
		create: $create,
	},
});

export default command;
