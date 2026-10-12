/** @generated from slurper-create-job */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs`,
	body: "json",
	errors: {
		409: "ConflictError",
	},
} as const;
