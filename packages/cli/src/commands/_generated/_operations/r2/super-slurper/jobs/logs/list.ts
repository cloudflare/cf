/** @generated from r2.super-slurper.jobs.logs.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}/logs`,
	query: ["limit", "offset"],
} as const;
