/** @generated from zero-trust-organization-get-your-zero-trust-organization-doh-settings */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/doh`,
} as const;
