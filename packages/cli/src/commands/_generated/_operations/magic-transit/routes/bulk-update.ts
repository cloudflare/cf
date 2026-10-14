/** @generated from magic-transit.routes.bulk-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
	body: "json",
} as const;
