/** @generated from logpush.account-jobs.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logpush/jobs/${request.job_id}`,
	body: "json",
} as const;
