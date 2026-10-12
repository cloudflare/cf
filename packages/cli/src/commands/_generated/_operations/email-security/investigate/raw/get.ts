/** @generated from email-security.investigate.raw.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email-security/investigate/${request.investigate_id}/raw`,
} as const;
