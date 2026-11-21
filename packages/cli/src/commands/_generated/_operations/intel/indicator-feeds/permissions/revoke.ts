/** @generated from intel.indicator-feeds.permissions.revoke */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/permissions/remove`,
	body: "json",
} as const;
