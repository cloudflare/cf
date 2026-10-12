/** @generated from archive-security-center-insight-deprecated */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/attack-surface-report/issues/${request.issue_id}/dismiss`,
	body: "json",
} as const;
