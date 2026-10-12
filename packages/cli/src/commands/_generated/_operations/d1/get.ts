/** @generated from d1.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}`,
	query: ["fields"],
	joined: ["fields"],
} as const;
