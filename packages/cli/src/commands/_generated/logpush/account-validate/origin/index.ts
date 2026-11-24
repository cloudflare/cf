import $create from "./create.js";
/**
 * origin command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "origin",
	describe: "Operations for account-validate.origin",

	routes: {
		create: $create,
	},
});

export default command;
