/** @generated from custom-indicator-feeds-get-indicator-feeds */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/indicator-feeds`,
} as const;
