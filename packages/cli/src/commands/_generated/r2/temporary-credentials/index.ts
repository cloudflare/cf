import $create from "./create.js";
/**
 * temporary-credentials command group
 * @generated from apis/overlays/r2.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "temporary-credentials",
	describe:
		"Generate short-lived S3-compatible credentials scoped to specific buckets and operations",

	routes: {
		create: $create,
	},
});

export default command;
