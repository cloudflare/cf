import $create from "./create.js";
/**
 * tokens command group
 * @generated from apis/overlays/magic-network-monitoring.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "tokens",
	describe: "Operations for vpc-flows.tokens",

	routes: {
		create: $create,
	},
});

export default command;
