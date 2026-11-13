/** @generated from zero-trust.region.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/zerotrust/region`,
} as const;
