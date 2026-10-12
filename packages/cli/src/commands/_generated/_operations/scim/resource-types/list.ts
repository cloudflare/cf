/** @generated from scim-resource-types-list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/scim/v2/ResourceTypes`,
} as const;
