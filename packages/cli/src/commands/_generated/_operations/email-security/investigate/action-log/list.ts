/** @generated from email-security.investigate.action-log.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/${request.investigate_id}/action_log`,
	query: ["page", "per_page"],
} as const;
