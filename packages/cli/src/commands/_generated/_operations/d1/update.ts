/** @generated from d1.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}`,
	body: "json",
} as const;
