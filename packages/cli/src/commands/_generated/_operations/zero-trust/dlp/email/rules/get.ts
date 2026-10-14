/** @generated from zero-trust.dlp.email.rules.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules/${request.rule_id}`,
} as const;
