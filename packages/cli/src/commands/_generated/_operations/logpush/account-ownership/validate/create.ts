/** @generated from logpush.account-ownership.validate.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/logpush/ownership/validate`,
	body: "json",
} as const;
