/** @generated from magic-static-routes-delete-many-routes */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
	body: "json",
} as const;
