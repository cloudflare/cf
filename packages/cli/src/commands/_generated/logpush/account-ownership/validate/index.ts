import $create from "./create.js";
/**
 * validate command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "validate",
	describe: "Operations for account-ownership.validate",

	routes: {
		create: $create,
	},
});

export default command;
