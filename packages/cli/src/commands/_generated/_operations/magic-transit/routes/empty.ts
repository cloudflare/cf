/** @generated from magic-transit.routes.empty */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
	body: "json",
} as const;
