import $destinationexistsdelete from "./destination-exists-delete.js";
import $destination from "./destination/index.js";
import $origin from "./origin/index.js";
/**
 * account-validate command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-validate",
	describe: "Operations for account-validate",

	routes: {
		"destination-exists-delete": $destinationexistsdelete,
		destination: $destination,
		origin: $origin,
	},
});

export default command;
