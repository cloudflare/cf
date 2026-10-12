/** @generated from magic-static-routes-create-routes */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
	body: "json",
} as const;
