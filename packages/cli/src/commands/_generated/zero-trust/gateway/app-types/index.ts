import $list from "./list.js";
/**
 * app-types command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "app-types",
	describe: "Operations for gateway.app-types",

	routes: {
		list: $list,
	},
});

export default command;
