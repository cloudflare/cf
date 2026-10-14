/** @generated from r2.super-slurper.jobs.pause */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/slurper/jobs/${request.job_id}/pause`,
	errors: {
		409: "ConflictError",
	},
} as const;
