/** @generated from slurper-delete-job */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}`,
	errors: {
		409: "ConflictError",
	},
} as const;
