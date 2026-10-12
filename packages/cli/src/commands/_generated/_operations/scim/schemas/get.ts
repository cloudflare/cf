/** @generated from scim.schemas.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Schemas/${request.schema_id}`,
} as const;
