import $get from "./get.js";
/**
 * jobs command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "jobs",
	describe: "Operations for account-datasets.jobs",

	routes: {
		get: $get,
	},
});

export default command;
