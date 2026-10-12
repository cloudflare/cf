/** @generated from custom-indicator-feeds-view-permissions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/permissions/view`,
} as const;
