import $list from "./list.js";
/**
 * public command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "public",
	describe: "Operations for finetunes.public",

	routes: {
		list: $list,
	},
});

export default command;
