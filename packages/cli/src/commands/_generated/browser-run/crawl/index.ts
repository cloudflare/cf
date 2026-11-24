import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * crawl command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "crawl",
	describe: "Operations for crawl",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
