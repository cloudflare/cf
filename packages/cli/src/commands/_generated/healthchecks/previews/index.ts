import $create from "./create.js";
import $delete from "./delete.js";
import $get from "./get.js";
/**
 * previews command group
 * @generated from apis/overlays/healthchecks.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "previews",
	describe:
		"Test a health check configuration before deploying it to production",

	routes: {
		create: $create,
		delete: $delete,
		get: $get,
	},
});

export default command;
