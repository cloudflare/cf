/** @generated from account-settings-list-transformations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/transformations`,
} as const;
