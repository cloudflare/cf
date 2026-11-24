import $getoutput from "./get-output.js";
import $list from "./list.js";
import $run from "./run.js";
/**
 * skills command group
 * @generated from apis/overlays/cloudforce-one.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "skills",
	describe: "Operations for threat-signals.articles.skills",

	routes: {
		"get-output": $getoutput,
		list: $list,
		run: $run,
	},
});

export default command;
