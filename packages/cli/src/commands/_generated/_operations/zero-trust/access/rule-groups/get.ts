/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/access/groups/{group_id} */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/groups/${request.group_id}`,
} as const;
