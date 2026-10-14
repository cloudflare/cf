/** @generated from zero-trust.organization.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/organizations`,
	body: "json",
} as const;
