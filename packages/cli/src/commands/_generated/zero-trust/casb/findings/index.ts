import $export from "./export.js";
import $get from "./get.js";
import $ignore from "./ignore.js";
import $instances from "./instances/index.js";
import $list from "./list.js";
import $resetseverity from "./reset-severity.js";
import $tuneseverity from "./tune-severity.js";
import $unignore from "./unignore.js";
/**
 * findings command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "findings",
	describe: "Operations for casb.findings",

	routes: {
		export: $export,
		get: $get,
		ignore: $ignore,
		list: $list,
		"reset-severity": $resetseverity,
		"tune-severity": $tuneseverity,
		unignore: $unignore,
		instances: $instances,
	},
});

export default command;
