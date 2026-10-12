/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/access/groups */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/groups`,
	body: "json",
} as const;
