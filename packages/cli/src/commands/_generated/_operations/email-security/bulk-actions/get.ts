/** @generated from email-security.bulk-actions.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/bulk/${request.job_id}`,
} as const;
