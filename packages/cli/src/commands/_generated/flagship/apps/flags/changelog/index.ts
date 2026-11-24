import $list from "./list.js";
/**
 * changelog command group
 * @generated from apis/overlays/flagship.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "changelog",
	describe: "Operations for apps.flags.changelog",

	routes: {
		list: $list,
	},
});

export default command;
