import $get from "./get.js";
import $list from "./list.js";
/**
 * sensitivity-group-templates command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "sensitivity-group-templates",
	describe:
		"Data Loss Prevention - browse templates for creating sensitivity groups",

	routes: {
		get: $get,
		list: $list,
	},
});

export default command;
