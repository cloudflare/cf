import $create from "./create.js";
import $list from "./list.js";
/**
 * connector-interrupts command
 * @generated from apis/overlays/connector-interrupts.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "connector-interrupts",
	describe: "connector-interrupts",

	routes: {
		create: $create,
		list: $list,
	},
});

export default command;
