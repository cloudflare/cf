import $create from "./create.js";
/**
 * traceroutes command group
 * @generated from apis/overlays/diagnostics.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "traceroutes",
	describe:
		"Run traceroutes from Cloudflare data centers to diagnose network path issues",

	routes: {
		create: $create,
	},
});

export default command;
