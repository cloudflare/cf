/** @generated from get-security-center-partner-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/security-center/partners/${request.partner}/settings`,
} as const;
