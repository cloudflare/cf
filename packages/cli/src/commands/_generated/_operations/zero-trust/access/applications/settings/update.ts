/** @generated from generated:put:/{account_or_zone}/{account_or_zone_id}/access/apps/{app_id}/settings */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}/settings`,
	body: "json",
} as const;
