/** @generated from slurper-list-jobs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs`,
	query: ["limit", "offset"],
} as const;
