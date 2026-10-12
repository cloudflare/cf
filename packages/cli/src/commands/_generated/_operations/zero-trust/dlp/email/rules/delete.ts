/** @generated from zero-trust.dlp.email.rules.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/email/rules/${request.rule_id}`,
} as const;
