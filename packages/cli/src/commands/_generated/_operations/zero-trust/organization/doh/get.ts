/** @generated from zero-trust.organization.doh.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/access/organizations/doh`,
} as const;
