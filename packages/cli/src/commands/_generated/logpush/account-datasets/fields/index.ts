import $get from "./get.js";
/**
 * fields command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "fields",
	describe: "Operations for account-datasets.fields",

	routes: {
		get: $get,
	},
});

export default command;
