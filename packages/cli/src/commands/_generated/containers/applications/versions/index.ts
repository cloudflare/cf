import $list from "./list.js";
/**
 * versions command group
 * @generated from apis/overlays/containers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "versions",
	describe: "Inspect versions of scheduler-backed applications",

	routes: {
		list: $list,
	},
});

export default command;
