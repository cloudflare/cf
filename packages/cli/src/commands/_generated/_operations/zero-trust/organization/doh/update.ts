/** @generated from zero-trust-organization-update-your-zero-trust-organization-doh-settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/doh`,
	body: "json",
} as const;
