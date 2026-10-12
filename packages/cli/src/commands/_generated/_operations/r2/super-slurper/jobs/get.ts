/** @generated from slurper-get-job */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}`,
} as const;
