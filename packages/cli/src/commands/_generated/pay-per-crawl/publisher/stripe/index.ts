import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * stripe command group
 * @generated from apis/overlays/pay-per-crawl.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "stripe",
	describe: "Operations for publisher.stripe",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
