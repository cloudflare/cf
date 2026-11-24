import $list from "./list.js";
/**
 * oauth-scopes command group
 * @generated from apis/overlays/iam.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "oauth-scopes",
	describe: "Operations for oauth-scopes",

	routes: {
		list: $list,
	},
});

export default command;
