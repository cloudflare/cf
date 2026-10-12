/** @generated from email-security.phishguard.reports.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/phishguard/reports`,
	query: ["start", "end", "from_date", "to_date", "page", "per_page"],
} as const;
