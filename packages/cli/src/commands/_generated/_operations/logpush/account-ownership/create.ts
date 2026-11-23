/** @generated from logpush.account-ownership.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logpush/ownership`,
	body: "json",
} as const;
