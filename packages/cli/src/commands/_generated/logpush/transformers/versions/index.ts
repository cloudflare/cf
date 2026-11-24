import $list from "./list.js";
/**
 * versions command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "versions",
	describe: "Operations for transformers.versions",

	routes: {
		list: $list,
	},
});

export default command;
