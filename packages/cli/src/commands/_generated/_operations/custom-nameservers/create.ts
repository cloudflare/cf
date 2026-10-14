/** @generated from custom-nameservers.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/custom_ns`,
	body: "json",
} as const;
