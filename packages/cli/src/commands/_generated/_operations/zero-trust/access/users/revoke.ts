/** @generated from zero-trust.access.users.revoke */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/organizations/revoke_user`,
	body: "json",
} as const;
