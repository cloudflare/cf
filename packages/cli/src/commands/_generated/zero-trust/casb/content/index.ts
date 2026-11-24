import $export from "./export.js";
import $list from "./list.js";
/**
 * content command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "content",
	describe: "Operations for casb.content",

	routes: {
		export: $export,
		list: $list,
	},
});

export default command;
