import $fields from "./fields/index.js";
import $jobs from "./jobs/index.js";
/**
 * account-datasets command group
 * @generated from apis/overlays/logpush.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-datasets",
	describe: "Operations for account-datasets",

	routes: {
		fields: $fields,
		jobs: $jobs,
	},
});

export default command;
