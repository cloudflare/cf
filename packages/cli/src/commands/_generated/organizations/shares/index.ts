import $list from "./list.js";
/**
 * shares command group
 * @generated from apis/overlays/organizations.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "shares",
	describe: "Shares across the organization",

	routes: {
		list: $list,
	},
});

export default command;
