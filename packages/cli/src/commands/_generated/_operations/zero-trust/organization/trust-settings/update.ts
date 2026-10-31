/** @generated from zero-trust.organization.trust-settings.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/trust_settings`,
	body: "json",
} as const;
