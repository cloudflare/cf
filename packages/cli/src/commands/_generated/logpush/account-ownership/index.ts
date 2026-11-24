import $create from "./create.js";
import $validate from "./validate/index.js";
/**
 * account-ownership command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-ownership",
	describe: "Operations for account-ownership",

	routes: {
		create: $create,
		validate: $validate,
	},
});

export default command;
