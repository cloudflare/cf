import $create from "./create.js";
import $delete from "./delete.js";
import $list from "./list.js";
import $update from "./update.js";
/**
 * expressions command group
 * @generated from apis/overlays/content-scan.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "expressions",
	describe:
		"Custom expressions that tell the scanner how to reach content objects it cannot parse on its own",

	routes: {
		create: $create,
		delete: $delete,
		list: $list,
		update: $update,
	},
});

export default command;
