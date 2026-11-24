import $create from "./create.js";
/**
 * analyze command group
 * @generated from apis/overlays/ssl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "analyze",
	describe: "Operations for analyze",

	routes: {
		create: $create,
	},
});

export default command;
