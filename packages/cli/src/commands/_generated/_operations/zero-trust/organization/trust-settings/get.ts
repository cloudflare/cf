/** @generated from zero-trust.organization.trust-settings.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/trust_settings`,
} as const;
