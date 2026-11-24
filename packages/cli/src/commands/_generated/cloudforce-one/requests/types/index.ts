import $list from "./list.js";
/**
 * types command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "types",
	describe: "Operations for requests.types",

	routes: {
		list: $list,
	},
});

export default command;
