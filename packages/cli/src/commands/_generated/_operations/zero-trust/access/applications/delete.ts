/** @generated from generated:delete:/{account_or_zone}/{account_or_zone_id}/access/apps/{app_id} */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/apps/${request.app_id}`,
} as const;
