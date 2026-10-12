/** @generated from custom-indicator-feeds-remove-permission */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds/permissions/remove`,
	body: "json",
} as const;
