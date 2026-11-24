import $create from "./create.js";
/**
 * trial command group
 * @generated from apis/overlays/brand-protection.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "trial",
	describe: "Operations for trial",

	routes: {
		create: $create,
	},
});

export default command;
