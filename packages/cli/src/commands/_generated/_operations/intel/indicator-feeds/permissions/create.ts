/** @generated from intel.indicator-feeds.permissions.create */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/permissions/add`,
	body: "json",
} as const;
