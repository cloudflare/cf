/** @generated from magic-static-routes-list-routes */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
} as const;
