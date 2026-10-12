/** @generated from email-security.investigate.preview.generate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/preview`,
	body: "json",
} as const;
