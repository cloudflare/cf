import $inspect from "./inspect.js";
/**
 * spf command group
 * @generated from apis/overlays/email-auth.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "spf",
	describe: "Operations for spf",

	routes: {
		inspect: $inspect,
	},
});

export default command;
