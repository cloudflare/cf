/** @generated from slurper-abort-all-jobs */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/abortAll`,
} as const;
