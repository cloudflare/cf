import $create from "./create.js";
/**
 * live-view command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "live-view",
	describe: "Operations for devtools.browser.live-view",

	routes: {
		create: $create,
	},
});

export default command;
