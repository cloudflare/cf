/** @generated from magic-account-apps-list-apps */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/apps`,
} as const;
