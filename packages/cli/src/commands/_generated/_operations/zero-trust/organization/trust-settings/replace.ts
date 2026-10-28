/** @generated from zero-trust.organization.trust-settings.replace */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/trust_settings`,
	body: "json",
} as const;
