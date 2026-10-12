/** @generated from generated:put:/{account_or_zone}/{account_or_zone_id}/custom_pages/{identifier} */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_pages/${request.identifier}`,
	body: "json",
} as const;
