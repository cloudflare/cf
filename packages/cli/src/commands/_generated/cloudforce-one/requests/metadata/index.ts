import $list from "./list.js";
/**
 * metadata command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "metadata",
	describe: "Operations for requests.metadata",

	routes: {
		list: $list,
	},
});

export default command;
