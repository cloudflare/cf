/** @generated from generated:delete:/{account_or_zone}/{account_or_zone_id}/access/service_tokens/{service_token_id} */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/access/service_tokens/${request.service_token_id}`,
} as const;
