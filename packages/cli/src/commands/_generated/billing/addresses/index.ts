import $validate from "./validate.js";
/**
 * addresses command group
 * @generated from apis/overlays/billing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "addresses",
	describe: "Operations for addresses",

	routes: {
		validate: $validate,
	},
});

export default command;
