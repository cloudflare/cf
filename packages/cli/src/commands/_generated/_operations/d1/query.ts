/** @generated from d1.query */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/d1/database/${request.database_id}/query`,
	body: "json",
} as const;
