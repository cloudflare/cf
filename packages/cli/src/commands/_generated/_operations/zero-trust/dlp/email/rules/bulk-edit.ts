/** @generated from zero-trust.dlp.email.rules.bulk-edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules`,
	body: "json",
} as const;
