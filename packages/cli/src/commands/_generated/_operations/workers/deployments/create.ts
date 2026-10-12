/** @generated from workers.deployments.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/workers/scripts/${request.script_name}/deployments`,
	query: ["force"],
	body: "json",
	constants: {
		strategy: "percentage",
	},
} as const;
