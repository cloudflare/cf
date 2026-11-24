import $list from "./list.js";
/**
 * schemas command group
 * @generated from apis/overlays/web-assets.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "schemas",
	describe: "Operations for schemas",

	routes: {
		list: $list,
	},
});

export default command;
