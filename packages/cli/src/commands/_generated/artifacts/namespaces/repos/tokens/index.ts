import $list from "./list.js";
/**
 * tokens command group
 * @generated from apis/overlays/artifacts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe: "Operations for namespaces.repos.tokens",

	routes: {
		list: $list,
	},
});

export default command;
