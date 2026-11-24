import $create from "./create.js";
import $status from "./status.js";
/**
 * credentials command group
 * @generated from apis/overlays/basin-catalog.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "credentials",
	describe:
		"Catalog access credentials for external query engines (Spark, Trino, etc.)",

	routes: {
		create: $create,
		status: $status,
	},
});

export default command;
