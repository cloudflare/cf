import $list from "./list.js";
/**
 * authors command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "authors",
	describe: "Operations for authors",

	routes: {
		list: $list,
	},
});

export default command;
