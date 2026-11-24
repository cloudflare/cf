import $list from "./list.js";
/**
 * models command group
 * @generated from apis/overlays/ai.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "models",
	describe: "Operations for models",

	routes: {
		list: $list,
	},
});

export default command;
