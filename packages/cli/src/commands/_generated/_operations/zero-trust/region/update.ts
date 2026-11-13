/** @generated from zero-trust.region.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/region`,
	body: "json",
} as const;
