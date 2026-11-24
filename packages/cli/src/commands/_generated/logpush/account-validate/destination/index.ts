import $delete from "./delete.js";
/**
 * destination command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "destination",
	describe: "Operations for account-validate.destination",

	routes: {
		delete: $delete,
	},
});

export default command;
