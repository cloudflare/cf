/** @generated from r2.super-slurper.jobs.resume */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}/resume`,
} as const;
