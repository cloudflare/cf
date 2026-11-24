import $create from "./create.js";
/**
 * traces command group
 * @generated from apis/overlays/request-tracers.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "traces",
	describe:
		"Simulate request processing to debug rule matches, transforms, and routing decisions",

	routes: {
		create: $create,
	},
});

export default command;
