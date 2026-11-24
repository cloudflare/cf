import $activate from "./activate.js";
import $close from "./close.js";
import $create from "./create.js";
import $get from "./get.js";
import $list from "./list.js";
/**
 * targets command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "targets",
	describe: "Operations for devtools.browser.targets",

	routes: {
		activate: $activate,
		close: $close,
		create: $create,
		get: $get,
		list: $list,
	},
});

export default command;
