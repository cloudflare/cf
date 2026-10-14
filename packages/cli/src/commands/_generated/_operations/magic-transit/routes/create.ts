/** @generated from magic-transit.routes.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/routes`,
	body: "json",
} as const;
