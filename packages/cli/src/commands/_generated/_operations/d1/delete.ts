/** @generated from d1.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}`,
} as const;
