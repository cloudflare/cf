import $create from "./create.js";
import $delete from "./delete.js";
import $getraw from "./get-raw.js";
import $list from "./list.js";
import $poll from "./poll.js";
import $skills from "./skills/index.js";
import $update from "./update.js";
/**
 * feeds command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "feeds",
	describe: "Operations for threat-signals.feeds",

	routes: {
		create: $create,
		delete: $delete,
		"get-raw": $getraw,
		list: $list,
		poll: $poll,
		update: $update,
		skills: $skills,
	},
});

export default command;
