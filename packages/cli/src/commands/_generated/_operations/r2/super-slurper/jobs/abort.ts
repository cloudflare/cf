/** @generated from r2.super-slurper.jobs.abort */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}/abort`,
} as const;
