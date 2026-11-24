import $create from "./create.js";
/**
 * bulk command group
 * @generated from apis/overlays/magic-transit.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "bulk",
	describe: "Operations for advanced-tcp-protection.configs.prefixes.bulk",

	routes: {
		create: $create,
	},
});

export default command;
