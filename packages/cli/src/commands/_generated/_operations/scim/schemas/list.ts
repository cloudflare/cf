/** @generated from scim-schemas-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/Schemas`,
} as const;
